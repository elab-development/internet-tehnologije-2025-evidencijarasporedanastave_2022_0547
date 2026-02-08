'use server'

import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function dodajKorisnika(formData: FormData) {
  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  
  const slug = ime.toLowerCase().replace(/\s+/g, '-');

  await db.insert(korisnik).values({
    ime,
    email,
    slug,
    password: "test-password-123", 
    role: "student",
  });

  revalidatePath("/");
}

// --- FUNKCIJA ZA IZMENU PROFILA SA REDIREKCIJOM ---
export async function azurirajProfil(formData: FormData) {
  const id = formData.get("id") as string;
  const novoIme = formData.get("ime") as string;
  const noviEmail = formData.get("email") as string;

  if (!id) return;

  // 1. Ažuriramo bazu podataka
  await db.update(korisnik)
    .set({ 
        ime: novoIme, 
        email: noviEmail,
        slug: novoIme.toLowerCase().replace(/\s+/g, '-') 
    })
    .where(eq(korisnik.id, id));

  // 2. Ažuriramo kolačić da bi sesija ostala aktivna sa novim emailom
  const cookieStore = await cookies();
  cookieStore.set("user_email", noviEmail, { path: "/" });

  // 3. Osvežavamo keš na svim bitnim stranicama
  revalidatePath("/student");
  revalidatePath("/student/profil");
  revalidatePath("/kalendar");

  // 4. Vraćamo studenta na dashboard
  redirect("/student");
}

// --- SERVER LOGOUT ---
export async function logoutAkcija() {
    const cookieStore = await cookies();
    cookieStore.delete('user_email');
    cookieStore.delete('auth_token'); 
}