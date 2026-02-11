import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq, desc } from "drizzle-orm"; 
import { dodajKorisnika } from "../actions"; 
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers'; 
import { redirect } from 'next/navigation';
import Link from 'next/link';

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

  const sviKorisniciIzBaze = await db.select().from(korisnik).orderBy(desc(korisnik.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={adminPodaci.ime} userRole={adminPodaci.role} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
              {adminPodaci.role} Control Panel
            </span>
            <h1 className="text-6xl font-black text-slate-900 mt-6 tracking-tighter uppercase leading-none">
              Upravljanje <span className="text-red-600">Sistemom</span>
            </h1>
          </div>
          
          <Link 
            href="/admin/kalendar" 
            className="group flex items-center gap-4 bg-white border-2 border-slate-900 p-2 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
          >
            <div className="bg-red-600 text-white p-3 rounded-xl group-hover:bg-red-500">
              <span className="text-xl">📅</span>
            </div>
            <div className="pr-6 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-500">Pregled nastave</p>
              <p className="font-black uppercase text-xs group-hover:text-white">Admin Kalendar</p>
            </div>
          </Link>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <h2 className="text-xl font-black mb-8 uppercase tracking-tight text-slate-800">
             Upiši novog korisnika
          </h2>
          
          <form action={dodajKorisnika} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Ime i Prezime</label>
                  <input name="ime" className="bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold" placeholder="Npr. Marko Marković" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Adresa</label>
                  <input name="email" type="email" className="bg-slate-50 border-2 border-transparent p-4 rounded-2xl focus:border-red-600 focus:bg-white outline-none transition-all font-bold" placeholder="marko@fakultet.rs" required />
                </div>
            </div>

            <div className="flex items-center gap-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Uloga:</span>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="role" value="student" defaultChecked className="w-5 h-5 accent-red-600" />
                    <span className="text-xs font-black uppercase text-slate-600 group-hover:text-red-600">Student</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="role" value="teacher" className="w-5 h-5 accent-red-600" />
                    <span className="text-xs font-black uppercase text-slate-600 group-hover:text-red-600">Nastavnik</span>
                </label>
            </div>

            <button type="submit" className="bg-red-600 text-white px-10 py-5 rounded-2xl hover:bg-red-700 transition-all font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-red-200 self-center md:self-start">
              Potvrdi i Kreiraj
            </button>
          </form>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tight">Registrovani Korisnici ({sviKorisniciIzBaze.length})</h2>
          <div className="grid gap-3">
            {sviKorisniciIzBaze.map((u) => (
              <div key={u.id} className="bg-slate-50 p-6 rounded-3xl border border-transparent flex flex-col md:flex-row justify-between items-center hover:bg-white hover:border-red-100 hover:shadow-lg transition-all group">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-red-600 shadow-sm group-hover:bg-red-50 transition-colors">
                    {u.ime.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-black uppercase text-sm tracking-tight">{u.ime}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{u.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    u.role === 'admin' ? 'bg-red-100 text-red-600' : 
                    u.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {u.role || 'user'}
                  </span>

                  <Link 
                    href={`/admin/izmeni/${u.id}`} 
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Izmeni
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}