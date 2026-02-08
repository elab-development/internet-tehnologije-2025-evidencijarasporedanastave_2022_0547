import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Provera korisnika u bazi podataka
    const existingUser = await db
      .select()
      .from(korisnik)
      .where(
        and(
          eq(korisnik.email, email),
          eq(korisnik.password, password)
        )
      )
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      
      // Kreiramo odgovor sa podacima o korisniku
      const response = NextResponse.json({ 
        message: "Uspešan login", 
        role: user.role,
        ime: user.ime 
      });

      // KLJUČNI DEO: Postavljamo 'auth_token' koji Middleware proverava
      response.cookies.set('auth_token', 'ulogovan-korisnik-sesija', {
        httpOnly: true, // Sprečava XSS napade jer JS ne može da čita ovaj cookie
        secure: process.env.NODE_ENV === 'production', // Koristi HTTPS u produkciji
        maxAge: 60 * 60 * 24, // Trajanje sesije: 24 sata
        path: '/', // Cookie važi za ceo sajt
      });

      return response;
    }

    // JSON odgovor za neuspešan login (REST konvencija)
    return NextResponse.json(
      { error: "Neispravni podaci (email ili lozinka)" }, 
      { status: 401 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: "Greška na serveru prilikom prijave" }, 
      { status: 500 }
    );
  }
}