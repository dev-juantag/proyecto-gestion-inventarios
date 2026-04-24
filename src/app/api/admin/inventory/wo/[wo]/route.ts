import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyJWT } from "@/lib/auth/auth";

// Helper para validar rol Super Admin
async function requireSuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyJWT(token);
    // Verificamos que el payload tenga el rol de Super Admin
    if (!payload || payload.role !== "Super Admin") return null;
    return { id: payload.sub, role: payload.role };
  } catch (err) {
    return null;
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ wo: string }> }
) {
  const user = await requireSuperAdmin();
  if (!user) {
    return NextResponse.json(
      { error: "No autorizado. Se requiere rol Super Admin para eliminar lotes completos." }, 
      { status: 403 }
    );
  }

  const { wo } = await params;

  if (!wo) {
    return NextResponse.json({ error: "Se requiere la WO para eliminar" }, { status: 400 });
  }

  try {
    // 1. Verificar si la WO existe
    const lotes = await (prisma as any).lote.findMany({
      where: { wo: wo }
    });

    if (lotes.length === 0) {
      return NextResponse.json({ error: "No se encontraron lotes asociados a esta WO" }, { status: 404 });
    }

    // 2. Eliminar los lotes
    // Nota: El esquema tiene onDelete: Cascade en Estiba -> Lote, 
    // y Ubicacion tiene onDelete: SetNull en estibaId.
    // Esto significa que al borrar el Lote, se borran sus Estibas y las ubicaciones quedan libres automáticamente.
    
    await (prisma as any).lote.deleteMany({
      where: { wo: wo }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Orden de Trabajo ${wo} eliminada exitosamente. Todas las posiciones en el rack han sido liberadas.` 
    });

  } catch (error) {
    console.error("Delete WO Error:", error);
    return NextResponse.json({ error: "Error interno al intentar eliminar la WO" }, { status: 500 });
  }
}
