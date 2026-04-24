import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  return NextResponse.json({ success: true, user: session });
}
