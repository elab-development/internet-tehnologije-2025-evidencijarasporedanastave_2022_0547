import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // DEBUG: Ovo ćeš videti u terminalu gde ti radi npm run dev
  console.log(`Middleware provera - Putanja: ${pathname}, Token postoji: ${!!token}`);

  // 1. Dozvoli putanje koje ne zahtevaju login (javne putanje)
  if (
    pathname === '/login' || 
    pathname.startsWith('/api/') || 
    pathname.includes('.') // statični fajlovi
  ) {
    return NextResponse.next();
  }

  // 2. Zaštita dashboard ruta
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
  // Pojednostavljen matcher da ne bi bilo regex grešaka
  matcher: ['/admin/:path*', '/student/:path*', '/teacher/:path*'],
};