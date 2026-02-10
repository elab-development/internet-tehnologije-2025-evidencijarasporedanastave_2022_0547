import { db } from '@/db';
import { korisnik } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ime } = body;
    
    const cookieStore = await cookies();
    const email = cookieStore.get('user_email')?.value;

    console.log("Pokušaj ažuriranja za email:", email); // Ovo ćeš videti u terminalu
    console.log("Novo ime:", ime);

    if (!email) {
      console.log("Greška: Email nije pronađen u kolačićima!");
      return NextResponse.json({ error: "Niste autorizovani" }, { status: 401 });
    }

    // Ažuriranje u bazi
    const result = await db
      .update(korisnik)
      .set({ ime: ime })
      .where(eq(korisnik.email, email));

    console.log("Uspešno ažurirano u bazi!");

    return NextResponse.json({ message: "Uspešno sačuvano" }, { status: 200 });
  } catch (error: any) {
    console.error("KRITIČNA GREŠKA U API RUTI:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}