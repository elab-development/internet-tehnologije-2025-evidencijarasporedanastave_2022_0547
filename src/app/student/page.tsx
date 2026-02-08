import { db } from "@/db";
import { raspored, predmet, prisustvo, korisnik } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Navbar from '../../components/navbar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  // 1. Čitamo parametre iz URL-a da vidimo da li je profil ažuriran
  const params = await searchParams;
  const isSuccess = params.success === "true";

  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;

  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const student = ulogovaniKorisnici[0];

  if (!student || student.role !== 'student') {
    redirect('/login');
  }

  const mojiTermini = await db
    .select({
      id: raspored.id,
      dan: raspored.danUNedelji,
      pocetak: raspored.vremePocetka,
      kraj: raspored.vremeZavrsetka,
      kabinet: raspored.kabinet,
      nazivPredmeta: predmet.naziv,
      statusPrisustva: prisustvo.status,
    })
    .from(prisustvo)
    .innerJoin(raspored, eq(prisustvo.rasporedId, raspored.id))
    .innerJoin(predmet, eq(raspored.predmetId, predmet.id))
    .where(eq(prisustvo.korisnikId, student.id));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={student.ime} userRole={student.role} />

      {/* --- POPUP PORUKA ZA USPEŠNU IZMENU --- */}
      {isSuccess && (
        <div className="max-w-4xl mx-auto px-6 mt-6 animate-bounce">
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3">
            <span className="text-lg">✅</span>
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">
              Profil je uspešno ažuriran!
            </span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-16">
          <div>
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {student.role} Dashboard
            </span>
            <h2 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
              Zdravo, <span className="text-blue-600">{student.ime}</span>!
            </h2>
          </div>
          
          <Link 
            href="/student/profil" 
            className="border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all text-center block"
          >
            Izmeni Profil
          </Link>
        </div>

        <div className="grid gap-6">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Tvoj nedeljni raspored</h3>
          
          {mojiTermini.length === 0 ? (
            <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nemaš zakazanih termina za prisustvo.</p>
            </div>
          ) : (
            mojiTermini.map((termin) => (
              <div key={termin.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-md">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{termin.nazivPredmeta}</h3>
                  <p className="text-slate-500 font-bold mt-1 uppercase text-[10px] tracking-widest">
                    {termin.dan} | {termin.pocetak.slice(0,5)} - {termin.kraj.slice(0,5)} | Sala {termin.kabinet || "N/A"}
                  </p>
                  
                  <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase ${termin.statusPrisustva === 'Prisutan' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                     {termin.statusPrisustva}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto mt-6 md:mt-0">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg hover:bg-blue-700 transition-all text-[10px] uppercase tracking-widest">
                    Potvrdi prisustvo
                  </button>
                  
                  <a 
                    href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(termin.nazivPredmeta)}&details=Predavanje&location=Sala+${termin.kabinet}`}
                    target="_blank"
                    className="text-center border border-slate-200 text-slate-400 px-8 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-[10px] uppercase tracking-widest"
                  >
                    Dodaj u Google Calendar
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}