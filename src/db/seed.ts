import "dotenv/config";
import bcrypt from "bcryptjs";
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
  // Hashujemo lozinku jednom
  const passwordHash = await bcrypt.hash("1233", 10);

  await db.transaction(async (tx) => {
    // 1. BRISANJE (Redosled je bitan zbog stranih ključeva!)
    await tx.delete(prisustvo);
    await tx.delete(raspored);
    await tx.delete(kalendar);
    await tx.delete(predmet);
    await tx.delete(korisnik);

    // 2. KORISNICI
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

    // DODATO: Test nastavnik kako bismo povezali predmete
    const [profesor] = await tx
      .insert(korisnik)
      .values({
        ime: "Dragan Petrović",
        slug: "dragan-petrovic",
        email: "dragan@nastavnik.rs",
        password: passwordHash,
        role: "nastavnik",
      })
      .returning();

    // 3. PREDMETI
    // ISPRAVLJENO: Dodat nastavnikId jer je obavezan u novoj šemi
    const [iteh] = await tx
      .insert(predmet)
      .values({
        naziv: "Internet Tehnologije",
        slug: "internet-tehnologije",
        opis: "Razvoj modernih veb aplikacija",
        nastavnikId: profesor.id, // Povezujemo predmet sa profesorom
      })
      .returning();

    const [prosoft] = await tx
      .insert(predmet)
      .values({
        naziv: "Projektovanje Softvera",
        slug: "projektovanje-softvera",
        opis: "Arhitektura i dizajn softverskih sistema",
        nastavnikId: profesor.id,
      })
      .returning();

    // 4. KALENDAR
    const [datum] = await tx
      .insert(kalendar)
      .values({
        datum: "2026-02-08",
        opis: "Februarski termin",
      })
      .returning();

    // 5. RASPORED
    const [termin] = await tx
      .insert(raspored)
      .values({
        danUNedelji: "Nedelja", // Postavio sam Nedelja da bi ti radilo testiranje danas
        vremePocetka: "14:00:00",
        vremeZavrsetka: "21:00:00",
        nastavniDan: "Predavanja",
        predmetId: iteh.id,
        kalendarId: datum.id,
        kabinet: "B001",
      })
      .returning();

    // 6. PRISUSTVO (Inicijalno dodeljujemo termin studentu kao 'Nije prisutan')
    // ISPRAVLJENO: KorisnikId i RasporedId moraju biti validni UUID-ovi
    await tx.insert(prisustvo).values({
      korisnikId: student.id,
      rasporedId: termin.id,
      datumPrisustva: "2026-02-08",
      status: "Nije prisutan", // Početni status pre evidencije
    });
  });

  console.log("✅ Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});