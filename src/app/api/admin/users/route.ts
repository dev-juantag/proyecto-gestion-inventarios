import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'Super Admin' && session.role !== 'Admin')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'Super Admin' && session.role !== 'Admin')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  try {
    const { correo, password, documento, nombre, apellidos, roleId } = await request.json();

    // Validar si el Admin está tratando de crear algo que no sea Operador (roleId 3)
    if (session.role === 'Admin' && roleId !== 3) {
      return NextResponse.json({ error: 'El administrador solo puede crear operadores.' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        correo,
        password: hashedPassword,
        documento,
        nombre,
        apellidos,
        roleId: Number(roleId),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'El correo o documento ya existe.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
