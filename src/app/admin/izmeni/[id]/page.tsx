import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminAzurirajKorisnika } from "@/app/actions"; // Koristimo akciju za admina
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";

// Next.js 15 zahteva da params budu Promise
interface EditUserProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserProps) {
  // Dobijamo ID korisnika kojeg menjamo iz URL-a
  const { id } = await params;

  // Proveravamo ko je ulogovani admin (zbog Navbara i bezbednosti)
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  
  const ulogovaniAdminRezultat = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  const admin = ulogovaniAdminRezultat[0];
  
  if (!admin || admin.role.toLowerCase() !== 'admin') redirect('/login');

  const korisnikZaIzmenuRezultat = await db.select().from(korisnik).where(eq(korisnik.id, id)).limit(1);
  const u = korisnikZaIzmenuRezultat[0];

  // Ako korisnik sa tim ID-em ne postoji
  if (!u) redirect('/admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={admin.ime} userRole={admin.role} />
      
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
            Izmena <span className="text-red-600">Korisnika</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest">
            Menjate podatke za: <span className="text-slate-900">{u.ime}</span> (ID: {u.id})
          </p>
        </div>
        
        {/* Koristimo adminAzurirajKorisnika akciju */}
        <form action={adminAzurirajKorisnika} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-6">
          
          {/* Hidden polje šalje ID korisnika kojeg menjamo, a ne adminov ID! */}
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
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Uloga</label>
            <select 
              name="role" 
              defaultValue={u.role}
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all appearance-none"
            >
              <option value="student">STUDENT</option>
              <option value="teacher">TEACHER</option>
              <option value="admin">ADMIN</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nova Šifra (ostavi prazno ako ne menjaš)</label>
            <input 
              name="password" 
              type="password"
              placeholder="Unesite novu šifru"
              className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
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
              Sačuvaj Izmene
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}