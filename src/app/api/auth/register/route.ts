import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ime, email, password, role } = body;

  
    if (!ime || !email || !password) {
      return NextResponse.json(
        { error: "Sva polja (ime, email, lozinka) su obavezna" }, 
        { status: 400 }
      );
    }

   
    const noviKorisnik = await db.insert(korisnik).values({
      ime,
      email,
      password, 
      role: role || 'student',
      slug: ime.toLowerCase().trim().replace(/\s+/g, '-'),
    }).returning();

    
    return NextResponse.json(
      { 
        message: "Korisnik uspešno registrovan", 
        user: { id: noviKorisnik[0].id, ime: noviKorisnik[0].ime } 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
   
    if (error.code === '23505') { 
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