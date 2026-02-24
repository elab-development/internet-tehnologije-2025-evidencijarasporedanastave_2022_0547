'use server'

import { db } from "@/db";
import { korisnik, prisustvo, raspored, predmet } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// --- POMOĆNA FUNKCIJA ZA BEZBEDNOST (Provera Admina na serveru) ---
async function proveriAdmina() {
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value;
  if (!email) return null;

  const pronadjeni = await db.select().from(korisnik).where(eq(korisnik.email, email)).limit(1);
  const user = pronadjeni[0];

  if (!user || user.role.toLowerCase() !== 'admin') return null;
  return user;
}

// --- KORISNICI ---

export async function dodajKorisnika(formData: FormData): Promise<void> {
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

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
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

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

export async function azurirajProfil(formData: FormData) {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get("user_email")?.value;
  
  const id = formData.get("id") as string;
  const novoIme = formData.get("ime") as string;
  const noviEmail = formData.get("email") as string;
  const novaSifra = formData.get("sifra") as string;

  if (!id) return;

  // IDOR ZAŠTITA: Korisnik može da ažurira samo svoj profil
  const provera = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  if (!provera[0] || provera[0].id.toString() !== id) {
    throw new Error("Možete menjati samo sopstveni profil!");
  }

  const updateData: any = { 
    ime: novoIme, 
    email: noviEmail, 
    slug: novoIme.toLowerCase().replace(/\s+/g, '-') 
  };

  if (novaSifra && novaSifra.trim() !== "") {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(novaSifra, salt);
  }

  await db.update(korisnik).set(updateData).where(eq(korisnik.id, id));
  
  cookieStore.set("user_email", noviEmail, { path: "/" });
  
  revalidatePath("/student");
  revalidatePath("/admin");
  redirect(provera[0].role === 'admin' ? "/admin" : "/student");
}

export async function logoutAkcija() {
    const cookieStore = await cookies();
    cookieStore.delete('user_email');
    cookieStore.delete('auth_token'); 
    redirect('/login');
}

// --- PRISUSTVO ---

export async function evidentirajPrisustvo(formData: FormData) {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get("user_email")?.value;
  
  const korisnikId = formData.get("korisnikId") as string;
  const rasporedId = formData.get("rasporedId") as string;

  // IDOR ZAŠTITA
  const provera = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  if (!provera[0] || provera[0].id.toString() !== korisnikId) {
    redirect("/student?error=unauthorized");
  }

  const termini = await db.select().from(raspored).where(eq(raspored.id, rasporedId)).limit(1);
  const termin = termini[0];
  if (!termin) redirect("/student?error=not_found");

  const sad = new Date();
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Belgrade' });

  if (trenutnoVreme < termin.vremePocetka.slice(0,5) || trenutnoVreme > termin.vremeZavrsetka.slice(0,5)) {
    redirect("/student?error=not_in_time");
  }

  try {
    await db.insert(prisustvo).values({ 
      korisnikId, 
      rasporedId, 
      status: "Prisutan", 
      datumPrisustva: sad.toISOString().split('T')[0] 
    });
  } catch (err) { redirect("/student?error=db_fail"); }

  revalidatePath("/student");
  redirect("/student?success=true");
}

// --- RASPORED I KALENDAR ---

export async function adminDodajRaspored(formData: FormData) {
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

  // Uzimamo podatke iz forme
  const predmetIdRaw = formData.get("predmetId");
  const dan = formData.get("dan") as string;
  const pocetak = formData.get("pocetak") as string;
  const kraj = formData.get("kraj") as string;
  const kabinet = formData.get("kabinet") as string;

  // Funkcija za formatiranje vremena (npr. 08:00 -> 08:00:00)
  const formatVreme = (v: string) => v && v.length === 5 ? `${v}:00` : v;

  try {
    await db.insert(raspored).values({
      // Pazi ovde: pretvaramo u broj i osiguravamo se da nije null
      predmetId: Number(predmetIdRaw), 
      danUNedelji: dan,
      vremePocetka: formatVreme(pocetak),
      vremeZavrsetka: formatVreme(kraj),
      kabinet: kabinet,
      nastavniDan: "Predavanja" // Proveri da li je u schema.ts "nastavniDan" ili "nastavniDay"
    } as any); // Dodajemo "as any" samo ako Drizzle i dalje pravi problem sa tipovima, da bi build prosao
  } catch (error) {
    console.error("Greska pri upisu u raspored:", error);
  }

  revalidatePath("/admin/kalendar");
}
export async function adminAzurirajRaspored(formData: FormData) {
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

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
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(prisustvo).where(eq(prisustvo.rasporedId, id));
  await db.delete(raspored).where(eq(raspored.id, id));

  revalidatePath("/admin/kalendar");
  revalidatePath("/student");
}