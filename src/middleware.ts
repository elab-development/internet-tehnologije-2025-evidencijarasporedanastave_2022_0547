import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// OBAVEZNO mora imati "export" i ime "middleware"
export function middleware(request: NextRequest) {
  // Proveravamo da li postoji cookie koji smo postavili pri login-u
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Logika zaštite: Ako nema tokena, a ruta je admin, student ili teacher
  if (!token && (pathname.startsWith('/admin') || 
                 pathname.startsWith('/student') || 
                 pathname.startsWith('/teacher'))) {
    
    // Vraćamo ga na login stranicu (SK 2)
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Konfiguracija: Middleware će raditi samo na ovim rutama
export const config = {
  matcher: [
    '/admin/:path*', 
    '/student/:path*', 
    '/teacher/:path*'
  ],
};