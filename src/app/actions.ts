'use server'

import { db } from "@/db";
import { korisnik, prisustvo, raspored } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 1. Akcija za dodavanje korisnika (IZMENJENO)
export async function dodajKorisnika(formData: FormData): Promise<void> {
  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  const slug = ime.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    await db.insert(korisnik).values({
      ime,
      email,
      slug,
      password: "test-password-123",
      role: role || "student",
    });
  } catch (err) {
    console.error("Greška:", err);
    // Umesto return {error}, samo uradi return da završiš funkciju
    return; 
  }

  // Osvežavamo admin stranicu da bi se video novi korisnik na listi
  revalidatePath("/admin");
}

// 2. Akcija za izmenu profila
export async function azurirajProfil(formData: FormData) {
  const id = formData.get("id") as string;
  const novoIme = formData.get("ime") as string;
  const noviEmail = formData.get("email") as string;

  if (!id) return;

  await db.update(korisnik)
    .set({ 
        ime: novoIme, 
        email: noviEmail,
        slug: novoIme.toLowerCase().replace(/\s+/g, '-') 
    })
    .where(eq(korisnik.id, id));

  const cookieStore = await cookies();
  cookieStore.set("user_email", noviEmail, { path: "/" });

  revalidatePath("/student");
  revalidatePath("/student/profil");
  revalidatePath("/kalendar");
  revalidatePath("/admin"); // Dodato i ovde za svaki slučaj

  redirect("/student?success=true");
}

// 3. Akcija za logout
export async function logoutAkcija() {
    const cookieStore = await cookies();
    cookieStore.delete('user_email');
    cookieStore.delete('auth_token'); 
    redirect('/login'); // Dodat redirect na login nakon izlaska
}

// 4. KLJUČNA AKCIJA: EVIDENTIRAJ PRISUSTVO
export async function evidentirajPrisustvo(formData: FormData) {
  const korisnikId = formData.get("korisnikId") as string;
  const rasporedId = formData.get("rasporedId") as string;

  if (!korisnikId || !rasporedId) {
    redirect("/student?error=missing_data");
  }

  const termini = await db.select().from(raspored).where(eq(raspored.id, rasporedId)).limit(1);
  const termin = termini[0];

  if (!termin) redirect("/student?error=not_found");

  const sad = new Date();
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'Europe/Belgrade' 
  });

  const pocetak = termin.vremePocetka.slice(0, 5);
  const kraj = termin.vremeZavrsetka.slice(0, 5);

  // Provera vremena (string comparison radi za HH:mm)
  if (trenutnoVreme < pocetak || trenutnoVreme > kraj) {
    redirect("/student?error=not_in_time");
  }

  let uspesno = false;
  try {
    await db.insert(prisustvo).values({
      korisnikId: korisnikId,
      rasporedId: rasporedId,
      status: "Prisutan",
      datumPrisustva: sad.toISOString().split('T')[0],
    });
    uspesno = true;
  } catch (err) {
    console.error("Database Error:", err);
  }

  if (uspesno) {
    revalidatePath("/kalendar");
    revalidatePath("/student");
    redirect("/student?success=true");
  } else {
    redirect("/student?error=db_fail");
  }
}