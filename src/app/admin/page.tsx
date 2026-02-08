import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq, desc } from "drizzle-orm"; 
import { dodajKorisnika } from "../actions"; 
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers'; 
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;

  if (!ulogovaniEmail) redirect('/login');

  const pronadjeniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const adminPodaci = pronadjeniKorisnici[0];

  if (!adminPodaci || adminPodaci.role.toLowerCase() !== 'admin') {
    redirect('/login');
  }

  // Uzimamo sve korisnike, sortirane tako da najnoviji budu prvi
  const sviKorisniciIzBaze = await db.select().from(korisnik).orderBy(desc(korisnik.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={adminPodaci.ime} userRole={adminPodaci.role} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {adminPodaci.role} Dashboard
          </span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Upravljanje <span className="text-red-600">Sistemom</span>
          </h1>
        </div>

        {/* Forma za dodavanje */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-xl font-bold mb-6 italic text-slate-700 text-center md:text-left">
            Dodaj novog korisnika u sistem:
          </h2>
          
          <form action={dodajKorisnika} className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4">
                <input name="ime" className="border p-3 rounded-xl flex-1 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Ime i prezime" required />
                <input name="email" type="email" className="border p-3 rounded-xl flex-1 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Email adresa" required />
            </div>

            {/* IZBOR ULOGE (Radio buttons) */}
            <div className="flex items-center gap-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Odaberi Ulogu:</span>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="role" value="student" defaultChecked className="w-4 h-4 accent-red-600" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-red-600 transition-colors">Student</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="role" value="teacher" className="w-4 h-4 accent-red-600" />
                    <span className="text-sm font-bold text-slate-600 group-hover:text-red-600 transition-colors">Nastavnik</span>
                </label>
            </div>

            <button type="submit" className="bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-all font-black uppercase text-xs tracking-widest shadow-lg shadow-red-100 self-center md:self-start">
              Kreiraj Korisnika
            </button>
          </form>
        </div>

        {/* Lista korisnika */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 italic px-2">Registrovani korisnici:</h2>
          {sviKorisniciIzBaze.map((u) => (
            <div key={u.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-red-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold text-lg">{u.ime}</span>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{u.email}</span>
              </div>
              
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                u.role === 'admin' ? 'bg-red-100 text-red-600' : 
                u.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 
                'bg-emerald-100 text-emerald-600'
              }`}>
                {u.role || 'user'}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}