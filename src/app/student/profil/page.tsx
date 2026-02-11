import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import StudentProfilForma from "@/components/StudentProfilForma";

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get("user_email")?.value;
  
  if (!ulogovaniEmail) redirect("/login");

  const korisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
    
  const studentData = korisnici[0];

  if (!studentData) {
    console.log("Korisnik nije pronađen u bazi za email:", ulogovaniEmail);
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={studentData.ime} userRole={studentData.role} />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Podešavanja <span className="text-blue-600">Profila</span>
        </h1>

        <StudentProfilForma student={studentData} />
      </main>
    </div>
  );
}