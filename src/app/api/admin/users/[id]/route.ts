import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Solo el Super Admin puede editar usuarios.' }, { status: 403 });
  }

  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    const { correo, password, documento, nombre, apellidos, roleId, isActive } = await request.json();

    const updateData: any = {
      correo,
      documento,
      nombre,
      apellidos,
      roleId: Number(roleId),
      isActive
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Solo el Super Admin puede eliminar usuarios.' }, { status: 403 });
  }

  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    await prisma.user.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}
