import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// Helper para validar rol (Admin o Super Admin)
async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key-1234");
    const { payload } = await jwtVerify(token, secret);
    
    // Solo permitimos roles 1 (Super Admin) o 2 (Admin) habitualmente, o validamos por nombre de rol
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      include: { role: true },
    });

    if (!user || (user.role.name !== "Super Admin" && user.role.name !== "Admin")) {
      return null;
    }
    return user;
  } catch (err) {
    return null;
  }
}

// GET: Obtener resumen de racks
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const racks = await prisma.canal.groupBy({
      by: ['rack', 'isActive'],
      _count: {
        id: true, // cantidad de canales
      },
      _max: {
        nivel: true,
      }
    });
    return NextResponse.json({ success: true, racks });
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
    const { rack: rackId, niveles, profundidad } = data;

    if (!rackId || !niveles || !profundidad) {
      return NextResponse.json({ error: "Faltan parámetros (rack, niveles, profundidad)" }, { status: 400 });
    }

    // 2. Transacción para crear Rack (Canales + Ubicaciones)
    // Drive-in: 1 Rack = N Niveles x M Profundidad
    await prisma.$transaction(async (tx) => {
      for (let n = 1; n <= niveles; n++) {
        await tx.canal.create({
          data: {
            rack: rackId,
            nivel: n,
            maxCapacidad: profundidad,
            ubicaciones: {
              create: Array.from({ length: profundidad }).map((_, i) => ({
                profundidad: i + 1,
              })),
            },
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: `Rack ${rackId} creado exitosamente.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creando Rack" }, { status: 500 });
  }
}

// DELETE: Desactivar un Rack (Soft delete para no romper historial de estibas)
export async function DELETE(req: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  try {
    const { rack } = await req.json();
    if (!rack) return NextResponse.json({ error: "Se requiere el ID del rack" }, { status: 400 });

    const result = await prisma.canal.updateMany({
      where: { rack },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: `Rack ${rack} desactivado (${result.count} canales ocultos).` });
  } catch (error) {
    return NextResponse.json({ error: "Error desactivando Rack" }, { status: 500 });
  }
}
