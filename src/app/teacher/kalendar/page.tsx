import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import Navbar from '../../../components/navbar'; // Putanja prilagođena strukturi foldera
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TeacherPage() {
  // 1. Dobavljanje ulogovanog nastavnika iz kolačića
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const nastavnik = ulogovaniKorisnici[0];

  // Bezbednosna provera: Samo nastavnik sme da pristupi
  if (!nastavnik || nastavnik.role !== 'nastavnik') {
    redirect('/login');
  }

  // 2. Filtriranje: Uzimamo samo studente iz baze
  const studentiIzBaze = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.role, 'student'));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Prosleđujemo i userName i userRole da bi Navbar ispravno generisao linkove */}
      <Navbar userName={nastavnik.ime} userRole={nastavnik.role} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            {nastavnik.role} Dashboard
          </span>
          <h2 className="text-5xl font-black text-slate-900 mt-6 tracking-tight leading-none uppercase">
            Današnji <span className="text-green-600">Časovi</span>!
          </h2>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-[0.2em]">
             Nastavnik: {nastavnik.ime}
          </p>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/50 border border-slate-200">
          <h3 className="text-xl font-black mb-8 text-slate-800 border-b pb-4 border-slate-50 italic uppercase tracking-tighter">
            Evidencija prisustva studenata (SK 7):
          </h3>
          
          <div className="space-y-4">
            {studentiIzBaze.length === 0 ? (
              <p className="text-center text-slate-300 py-12 font-bold uppercase text-[10px] tracking-widest">
                Nema registrovanih studenata u sistemu.
              </p>
            ) : (
              studentiIzBaze.map((u) => (
                <div key={u.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center hover:bg-white hover:shadow-lg hover:border-green-100 transition-all group">
                  <div>
                    <h4 className="font-black text-lg text-slate-800 group-hover:text-green-600 transition-colors uppercase tracking-tight">
                      {u.ime}
                    </h4>
                    <p className="text-slate-400 text-xs font-medium italic">{u.email}</p>
                  </div>
                  
                  {/* Koristimo u.id (UUID) direktno da izbegnemo greške u bazi */}
                  <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 shadow-md transition-all active:scale-95">
                    Upiši prisustvo
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}