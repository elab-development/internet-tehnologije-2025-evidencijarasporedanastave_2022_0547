import { db } from "@/db";
import { resetZahtev, korisnik } from "@/db/schema"; // Uvozimo i tabelu korisnik
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await db.select().from(resetZahtev);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { email } = await req.json();
  await db.insert(resetZahtev).values({ email });
  return NextResponse.json({ success: true });
}

// NOVA LOGIKA: Admin odobrava i menja lozinku
export async function PATCH(req: Request) {
  try {
    const { email } = await req.json();

    // 1. Generišemo privremenu lozinku (npr. fon1234)
    const privremenaLozinka = "fon" + Math.floor(1000 + Math.random() * 9000);

    // 2. Ažuriramo tabelu KORISNIK (postavljamo novu lozinku)
    // PAŽNJA: Ako koristiš hashing (bcrypt), ovde bi trebalo da je hešuješ. 
    // Za potrebe projekta, stavićemo običan tekst ako ti je tako u bazi.
    await db.update(korisnik)
      .set({ password: privremenaLozinka })
      .where(eq(korisnik.email, email));

    // 3. Brišemo zahtev iz tabele reset_zahtev jer je završen
    await db.delete(resetZahtev).where(eq(resetZahtev.email, email));

    return NextResponse.json({ success: true, newPassword: privremenaLozinka });
  } catch (error) {
    return NextResponse.json({ error: "Greška pri resetovanju" }, { status: 500 });
  }
}