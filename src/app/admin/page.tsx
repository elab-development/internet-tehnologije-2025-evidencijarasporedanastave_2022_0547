import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq, desc } from "drizzle-orm"; 
import { dodajKorisnika } from "../actions"; 
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers'; 
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ResetRequests from './ResetRequests';

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
        
        {/* Header Sekcija sa dugmićima */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Admin Control</span>
            <h1 className="text-6xl font-black text-slate-900 mt-6 tracking-tighter uppercase leading-none">
              Upravljanje <span className="text-red-600">Sistemom</span>
            </h1>
          </div>
          
          {/* KONTEJNER ZA NAVIGACIONA DUGMAD */}
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/admin/statistika" 
              className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              📊 Analitički Pregled
            </Link>

            <Link 
              href="/admin/kalendar" 
              className="bg-white border-2 border-slate-900 p-4 rounded-2xl font-black uppercase text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
            >
              📅 Kalendar Nastave
            </Link>
          </div>
        </div>

        {/* 1. RESET ZAHTEVI */}
        <ResetRequests />

        {/* 2. FORMA ZA UPIS */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 mb-12">
          <h2 className="text-xl font-black mb-8 uppercase text-slate-800">Upiši novog korisnika</h2>
          <form action={dodajKorisnika} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="ime" placeholder="Ime i Prezime" className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600" required />
              <input name="email" type="email" placeholder="Email adresa" className="bg-slate-50 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600" required />
            </div>
            <button 
              type="submit" 
              suppressHydrationWarning
              className="bg-red-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest self-start"
            >
              Kreiraj nalog
            </button>
          </form>
        </div>

        {/* 3. LISTA KORISNIKA */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100">
          <h2 className="text-xl font-black text-slate-800 mb-8 uppercase">Registrovani Korisnici ({sviKorisniciIzBaze.length})</h2>
          <div className="grid gap-3">
            {sviKorisniciIzBaze.map((u) => (
              <div key={u.id} className="bg-slate-50 p-5 rounded-3xl flex justify-between items-center hover:bg-white hover:border-red-100 hover:shadow-lg transition-all border border-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-red-600">{u.ime.charAt(0)}</div>
                  <div><p className="font-black text-xs uppercase text-slate-800">{u.ime}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">{u.role}</span>
                  <Link href={`/admin/izmeni/${u.id}`} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase">Izmeni</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}