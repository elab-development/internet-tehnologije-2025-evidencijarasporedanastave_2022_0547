import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { azurirajProfil } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";

export default async function EditProfilePage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  
  const ulogovaniRezultat = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  const u = ulogovaniRezultat[0];
  
  if (!u || u.role !== 'admin') redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={u.ime} userRole={u.role} />
      
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
            Moj <span className="text-red-600">Profil</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest">
            Ažurirajte svoje lične podatke i pristupnu šifru
          </p>
        </div>
        
        <form action={azurirajProfil} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-6">
          <input type="hidden" name="id" value={u.id} />

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ime i prezime</label>
            <input 
              name="ime" 
              defaultValue={u.ime ?? ""} 
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email adresa</label>
            <input 
              name="email" 
              type="email"
              defaultValue={u.email ?? ""} 
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nova Šifra</label>
            <input 
              name="sifra" 
              type="password"
              placeholder="Unesite novu šifru"
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link 
              href="/admin" 
              className="text-center bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
            >
              ← Odustani
            </Link>

            <button 
              type="submit" 
              className="bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
            >
              Izmeni Podatke
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}