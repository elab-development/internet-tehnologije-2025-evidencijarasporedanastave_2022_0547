'use server'

import { db } from "@/db";
import { korisnik, prisustvo, raspored, predmet } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm"; // Dodat and za složenije provere
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

// POMOĆNA FUNKCIJA ZA PROVERU ADMINA (Zaštita od IDOR i neovlašćenog pristupa)
async function proveriAdmina() {
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value;
  if (!email) return null;

  const pronadjeni = await db.select().from(korisnik).where(eq(korisnik.email, email)).limit(1);
  const user = pronadjeni[0];

  if (!user || user.role.toLowerCase() !== 'admin') return null;
  return user;
}

export async function dodajKorisnika(formData: FormData): Promise<void> {
  // BEZBEDNOST: Provera uloge na serveru
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const slug = ime.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const hashedDefaultPassword = await bcrypt.hash("test-password-123", 10);

  try {
    // SQL INJECTION ZAŠTITA: Drizzle automatski parametrizuje ove vrednosti
    await db.insert(korisnik).values({
      ime, email, slug, password: hashedDefaultPassword, role: role || "student",
    });
  } catch (err) { console.error(err); return; }
  revalidatePath("/admin");
}

export async function adminAzurirajKorisnika(formData: FormData) {
  // BEZBEDNOST: Provera admina
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

export async function evidentirajPrisustvo(formData: FormData) {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get("user_email")?.value;
  
  const korisnikId = formData.get("korisnikId") as string;
  const rasporedId = formData.get("rasporedId") as string;

  // IDOR ZAŠTITA: Proveravamo da li ulogovani korisnik pokušava da prijavi prisustvo za SEBE, a ne za nekog drugog
  const korisnici = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  const user = korisnici[0];

  if (!user || user.id.toString() !== korisnikId) {
    redirect("/student?error=unauthorized"); // Sprečava studenta da menja ID u formi i prijavljuje druge
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

export async function obrisiRaspored(formData: FormData) {
  // BEZBEDNOST: Samo admin sme da briše iz rasporeda
  const admin = await proveriAdmina();
  if (!admin) throw new Error("Neovlašćen pristup!");

  const id = formData.get("id") as string;
  if (!id) return;

  await db.delete(prisustvo).where(eq(prisustvo.rasporedId, id));
  await db.delete(raspored).where(eq(raspored.id, id));

  revalidatePath("/admin/kalendar");
  revalidatePath("/student");
}

// Ostatak funkcija (logout, azurirajProfil itd.) ostaje sličan, 
// ali uvek sa proverom ID-a iz sesije (cookies) umesto samo iz formData.