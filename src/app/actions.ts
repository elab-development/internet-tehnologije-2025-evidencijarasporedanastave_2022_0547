'use server'

import { db } from "@/db";
import { korisnik, prisustvo, raspored, predmet } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// --- SEKCIJA 1: KORISNICI ---

export async function dodajKorisnika(formData: FormData): Promise<void> {
  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const slug = ime.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const hashedDefaultPassword = await bcrypt.hash("test-password-123", 10);

  try {
    await db.insert(korisnik).values({
      ime, email, slug, password: hashedDefaultPassword, role: role || "student",
    });
  } catch (err) { console.error(err); return; }
  revalidatePath("/admin");
}

export async function adminAzurirajKorisnika(formData: FormData) {
  const id = formData.get("id") as string;
  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const novaSifra = formData.get("password") as string;

  if (!id) return;
  const updateData: any = { ime, email, role, slug: ime.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') };

  if (novaSifra && novaSifra.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(novaSifra, salt);
  }

  await db.update(korisnik).set(updateData).where(eq(korisnik.id, id));
  revalidatePath("/admin");
  redirect("/admin");
}

// --- SEKCIJA 2: PROFIL I LOGOUT ---

export async function azurirajProfil(formData: FormData) {
  const id = formData.get("id") as string;
  const novoIme = formData.get("ime") as string;
  const noviEmail = formData.get("email") as string;
  if (!id) return;

  await db.update(korisnik).set({ ime: novoIme, email: noviEmail, slug: novoIme.toLowerCase().replace(/\s+/g, '-') }).where(eq(korisnik.id, id));
  const cookieStore = await cookies();
  cookieStore.set("user_email", noviEmail, { path: "/" });
  
  revalidatePath("/student");
  redirect("/student?success=true");
}

export async function logoutAkcija() {
    const cookieStore = await cookies();
    cookieStore.delete('user_email');
    cookieStore.delete('auth_token'); 
    redirect('/login');
}

// --- SEKCIJA 3: PRISUSTVO ---

export async function evidentirajPrisustvo(formData: FormData) {
  const korisnikId = formData.get("korisnikId") as string;
  const rasporedId = formData.get("rasporedId") as string;
  if (!korisnikId || !rasporedId) redirect("/student?error=missing_data");

  const termini = await db.select().from(raspored).where(eq(raspored.id, rasporedId)).limit(1);
  const termin = termini[0];
  if (!termin) redirect("/student?error=not_found");

  const sad = new Date();
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Belgrade' });

  if (trenutnoVreme < termin.vremePocetka.slice(0,5) || trenutnoVreme > termin.vremeZavrsetka.slice(0,5)) {
    redirect("/student?error=not_in_time");
  }

  try {
    await db.insert(prisustvo).values({ korisnikId, rasporedId, status: "Prisutan", datumPrisustva: sad.toISOString().split('T')[0] });
  } catch (err) { redirect("/student?error=db_fail"); }

  revalidatePath("/student");
  redirect("/student?success=true");
}

// --- SEKCIJA 4: KALENDAR (DODAVANJE, IZMENA, BRISANJE) ---

export async function adminDodajRaspored(formData: FormData) {
  const predmetId = formData.get("predmetId") as string;
  const dan = formData.get("dan") as string;
  const pocetak = formData.get("pocetak") as string;
  const kraj = formData.get("kraj") as string;
  const kabinet = formData.get("kabinet") as string;

  const formatVreme = (v: string) => v.length === 5 ? `${v}:00` : v;

  await db.insert(raspored).values({
    predmetId,
    danUNedelji: dan,
    vremePocetka: formatVreme(pocetak),
    vremeZavrsetka: formatVreme(kraj),
    kabinet,
    nastavniDan: "Predavanja" // Podrazumevano
  });

  revalidatePath("/admin/kalendar");
}

export async function adminAzurirajRaspored(formData: FormData) {
  const id = formData.get("id") as string;
  const dan = formData.get("dan") as string;
  const pocetak = formData.get("pocetak") as string;
  const kraj = formData.get("kraj") as string;
  const kabinet = formData.get("kabinet") as string;

  const formatVreme = (v: string) => v.length === 5 ? `${v}:00` : v;

  await db.update(raspored).set({
    danUNedelji: dan, vremePocetka: formatVreme(pocetak), vremeZavrsetka: formatVreme(kraj), kabinet
  }).where(eq(raspored.id, id));

  revalidatePath("/admin/kalendar");
  redirect("/admin/kalendar");
}

export async function obrisiRaspored(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(prisustvo).where(eq(prisustvo.rasporedId, id));
  await db.delete(raspored).where(eq(raspored.id, id));

  revalidatePath("/admin/kalendar");
  revalidatePath("/student");
}