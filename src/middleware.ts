import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  // Rutas públicas
  const isPublicRoute = request.nextUrl.pathname.startsWith('/login') || 
                        request.nextUrl.pathname.startsWith('/api/auth');

  // Si no hay token y no es ruta pública, redirigir al login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, validar
  if (token) {
    const payload = await verifyJWT(token);

    if (!payload && !isPublicRoute) {
      // Token inválido, limpiar cookie y al login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Usuario autenticado tratando de acceder a login, llevar al dashboard
    if (payload && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Role validation
    if (payload && request.nextUrl.pathname.startsWith('/dashboard/control')) {
      // Ejemplo: Role protection logic could go here based on payload.role parameter
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
