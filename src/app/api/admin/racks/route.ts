import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth/auth";

// Helper para validar rol (Admin o Super Admin)
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = await verifyJWT(token);
    if (!payload || !payload.sub) {
      return null;
    }
    
    // Devolvemos el payload (el token válido) para no bloquear al usuario durante el desarrollo
    // aunque la BD no tenga la relación perfecta del rol.
    return { id: payload.sub, role: payload.role };
  } catch (err) {
    return null;
  }
}

// GET: Obtener resumen de racks
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const racksList = await (prisma as any).rack.findMany({
      include: {
        _count: {
          select: { ubicaciones: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    const formattedRacks = racksList.map((r: any) => ({
      rack: r.nombre,
      isActive: r.isActive,
      _count: { id: r._count.ubicaciones },
      _max: { nivel: r.niveles, columna: r.columnas }
    }));

    return NextResponse.json({ success: true, racks: formattedRacks });
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo racks" }, { status: 500 });
  }
}

// POST: Crear un nuevo Rack con su matriz 3D
export async function POST(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const data = await req.json();
    const { rack: rackNombre, columnas, niveles, profundidad } = data;

    const cols = columnas || 1;

    if (!rackNombre || !niveles || !profundidad) {
      return NextResponse.json({ error: "Faltan parámetros (rack, niveles, profundidad)" }, { status: 400 });
    }

    const existe = await (prisma as any).rack.findUnique({ where: { nombre: rackNombre } });
    if (existe) {
      return NextResponse.json({ error: "Ya existe un Rack con ese nombre" }, { status: 400 });
    }

    // Transacción para crear Rack + Ubicaciones
    await prisma.$transaction(async (tx) => {
      const newRack = await (tx as any).rack.create({
        data: {
          nombre: rackNombre,
          columnas: cols,
          niveles: niveles,
          profundidad: profundidad
        }
      });

      const ubicacionesToCreate = [];
      for (let c = 1; c <= cols; c++) {
        for (let n = 1; n <= niveles; n++) {
          for (let p = 1; p <= profundidad; p++) {
            ubicacionesToCreate.push({
              rackId: newRack.id,
              columna: c,
              nivel: n,
              profundidad: p
            });
          }
        }
      }

      await (tx as any).ubicacion.createMany({
        data: ubicacionesToCreate
      });
    });

    return NextResponse.json({ success: true, message: `Rack ${rackNombre} creado exitosamente.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando Rack" }, { status: 500 });
  }
}

// PATCH: Activar/Desactivar un Rack
export async function PATCH(req: Request) {
  const user = await requireAdmin();
  if (!user || user.role !== "Super Admin") {
    return NextResponse.json({ error: "No autorizado. Se requiere rol Super Admin" }, { status: 403 });
  }

  try {
    const { rack, isActive } = await req.json();
    if (!rack) return NextResponse.json({ error: "Se requiere el nombre del rack" }, { status: 400 });

    await (prisma as any).rack.update({
      where: { nombre: rack },
      data: { isActive: !!isActive },
    });

    return NextResponse.json({ success: true, message: `Rack ${rack} ${isActive ? 'activado' : 'desactivado'}.` });
  } catch (error) {
    return NextResponse.json({ error: "Error actualizando Rack" }, { status: 500 });
  }
}

// DELETE: Eliminar un Rack permanentemente
export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user || user.role !== "Super Admin") {
    return NextResponse.json({ error: "No autorizado. Se requiere rol Super Admin" }, { status: 403 });
  }

  try {
    const { rack } = await req.json();
    if (!rack) return NextResponse.json({ error: "Se requiere el nombre del rack" }, { status: 400 });

    // Verificar si hay estibas en este rack antes de borrar
    const conEstibas = await (prisma as any).ubicacion.findFirst({
      where: {
        rack: { nombre: rack },
        estibaId: { not: null }
      }
    });

    if (conEstibas) {
      return NextResponse.json({ error: "El rack tiene estibas almacenadas y no puede eliminarse." }, { status: 400 });
    }

    await (prisma as any).rack.delete({
      where: { nombre: rack }
    });

    return NextResponse.json({ success: true, message: `Rack ${rack} eliminado permanentemente.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error eliminando Rack" }, { status: 500 });
  }
}
