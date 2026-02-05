import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "./index"; 
import {
  korisnik,
  predmet,
  kalendar,
  raspored,
  prisustvo,
} from "./schema";

console.log("🌱 Seeding database...");

async function seed() {
  // Hashujemo lozinku jednom da bismo je koristili za sve test korisnike
  const passwordHash = await bcrypt.hash("1233", 10);

  await db.transaction(async (tx) => {
    // 1. BRISANJE (Redosled je bitan zbog stranih ključeva!)
    await tx.delete(prisustvo);
    await tx.delete(raspored);
    await tx.delete(kalendar);
    await tx.delete(predmet);
    await tx.delete(korisnik);

    // 2. KORISNICI
    // =====================
    // USERS
    // =====================
    const [admin] = await tx
      .insert(korisnik)
      .values({
        ime: "Admin Korisnik",
        slug: "admin-korisnik",
        email: "admin@fakultet.rs",
        password: passwordHash,
        role: "admin",
      })
      .returning();

    const [student] = await tx
      .insert(korisnik)
      .values({
        ime: "Bogdan Bogdanović",
        slug: "bogdan-bogdanovic",
        email: "bogdan@student.rs",
        password: passwordHash,
        role: "student",
      })
      .returning();

    // 3. PREDMETI
    const [iteh] = await tx
      .insert(predmet)
      .values({
        naziv: "Internet Tehnologije",
        slug: "internet-tehnologije",
        opis: "Razvoj modernih veb aplikacija",
      })
      .returning();

    // 4. KALENDAR
    const [datum] = await tx
      .insert(kalendar)
      .values({
        datum: "2026-02-05",
        opis: "Prvi termin nastave",
      })
      .returning();

    // 5. RASPORED
    const [termin] = await tx
      .insert(raspored)
      .values({
        danUNedelji: "Četvrtak",
        vremePocetka: "14:15:00",
        vremeZavrsetka: "17:00:00",
        nastavniDan: "Predavanja",
        predmetId: iteh.id,
        kalendarId: datum.id,
      })
      .returning();

    // 6. PRISUSTVO
    await tx.insert(prisustvo).values({
      korisnikId: student.id,
      rasporedId: termin.id,
      datumPrisustva: "2026-02-05",
      status: "prisutan",
    });
  });

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});