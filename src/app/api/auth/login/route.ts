import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

//autentifikaciona ruta

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    console.log(`Pokušaj prijave: ${email}`);

    const existingUser = await db
      .select()
      .from(korisnik)
      .where(
        and(
          sql`lower(${korisnik.email}) = ${email.toLowerCase().trim()}`,
          eq(korisnik.password, password)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      const normalizedRole = user.role.toLowerCase().trim();
      
      console.log(`Korisnik pronađen! Uloga: ${normalizedRole}, Ime: ${user.ime}`);

      const response = NextResponse.json({ 
        message: "Uspešan login", 
        role: normalizedRole, 
        ime: user.ime 
      }, { status: 200 });

      
      response.cookies.set('auth_token', 'ulogovan-korisnik-sesija', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 60 * 60 * 24, 
        path: '/',
        sameSite: 'lax'
      });

      response.cookies.set('user_email', user.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'lax'
      });

      return response;
    }

    return NextResponse.json(
      { error: "Neispravan email ili lozinka" }, 
      { status: 401 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { error: "Greška na serveru" }, 
      { status: 500 }
    );
  }
}