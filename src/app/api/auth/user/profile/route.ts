import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Dodali smo : Promise<NextResponse> da TypeScript tačno zna šta vraćamo
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Ako koristiš Next.js 15, ovde dodaj await ispred cookies()
    // Ako koristiš Next.js 14, ostavi bez await. 
    // Probaćemo sa await jer je to češći uzrok "crvenila" u novijim verzijama
    const cookieStore = await cookies(); 
    const email = cookieStore.get('user_email')?.value;

    if (!email) {
      return NextResponse.json({ error: "Niste autorizovani" }, { status: 401 });
    }

    const user = await db
      .select({
        ime: korisnik.ime,
        email: korisnik.email,
        role: korisnik.role,
      })
      .from(korisnik)
      .where(eq(korisnik.email, email))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
    }

    return NextResponse.json(user[0], { status: 200 });
  } catch (error) {
    console.error("Greška u profil ruti:", error);
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}