import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ime, email, password, role } = body;

    // Osnovna validacija podataka
    if (!ime || !email || !password) {
      return NextResponse.json(
        { error: "Sva polja (ime, email, lozinka) su obavezna" }, 
        { status: 400 }
      );
    }

    // Upis u bazu preko Drizzle ORM-a
    const noviKorisnik = await db.insert(korisnik).values({
      ime,
      email,
      password, // Napomena: U produkciji lozinka mora biti heširana
      role: role || 'student', // Default uloga je student
      slug: ime.toLowerCase().trim().replace(/\s+/g, '-'),
    }).returning();

    // Vraćanje kreiranog korisnika u JSON formatu (REST konvencija)
    return NextResponse.json(
      { 
        message: "Korisnik uspešno registrovan", 
        user: { id: noviKorisnik[0].id, ime: noviKorisnik[0].ime } 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    // Obrada grešaka u JSON formatu
    if (error.code === '23505') { // Postgres kod za Unique Constraint (npr. email već postoji)
      return NextResponse.json(
        { error: "Korisnik sa ovim email-om već postoji" }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Greška na serveru prilikom registracije" }, 
      { status: 500 }
    );
  }
}