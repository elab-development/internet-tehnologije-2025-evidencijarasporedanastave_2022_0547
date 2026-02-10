import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  console.log(`Middleware provera - Putanja: ${pathname}, Token postoji: ${!!token}`);

  if (
    pathname === '/login' || 
    pathname.startsWith('/api/') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/student') || 
    pathname.startsWith('/teacher');

  if (isProtectedRoute && !token) {
    console.log("Nema tokena, šaljem na login...");
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/student/:path*', '/teacher/:path*'],
};