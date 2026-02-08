import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { azurirajProfil } from "@/app/actions";
import Link from "next/link";

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get("user_email")?.value;
  
  if (!ulogovaniEmail) redirect("/login");

  const korisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
    
  const student = korisnici[0];

  if (!student) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={student.ime} userRole={student.role} />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">
          Podešavanja <span className="text-blue-600">Profila</span>
        </h1>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          {/* Kada klikneš na 'Sačuvaj izmene', 'azurirajProfil' akcija će:
              1. Promeniti bazu
              2. Osvežiti kolačiće
              3. Vratiti te na /student?success=true 
          */}
          <form action={azurirajProfil} className="flex flex-col gap-6">
            <input type="hidden" name="id" value={student.id} />

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                Puno Ime
              </label>
              <input 
                name="ime"
                defaultValue={student.ime}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                Email Adresa
              </label>
              <input 
                name="email"
                type="email"
                defaultValue={student.email}
                className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
                required
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="submit"
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
              >
                Sačuvaj izmene
              </button>
              
              <Link 
                href="/student"
                className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] text-center uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center"
              >
                Otkaži
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100">
            <p className="text-[10px] text-amber-700 font-black uppercase tracking-widest mb-1">Sigurnosna napomena</p>
            <p className="text-xs text-amber-600 font-medium">
                Sistem će te automatski vratiti na dashboard nakon uspešnog čuvanja. Ako promeniš email, tvoja sesija će biti automatski ažurirana.
            </p>
        </div>
      </main>
    </div>
  );
}