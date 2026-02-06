'use server'

import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function dodajKorisnika(formData: FormData) {
  const ime = formData.get("ime") as string;
  const email = formData.get("email") as string;
  
  // Automatski generišemo slug o kojem smo pričali
  const slug = ime.toLowerCase().replace(/\s+/g, '-');

  await db.insert(korisnik).values({
    ime,
    email,
    slug,
    password: "test-password-123", // Privremeno, dok ne ubaciš hashing
    role: "student",
  });

  // Osvežava stranicu da bismo videli novog korisnika
  revalidatePath("/");
}