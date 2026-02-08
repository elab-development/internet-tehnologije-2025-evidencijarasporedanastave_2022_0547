import { db } from "@/db";
import { raspored, predmet, prisustvo, korisnik } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Navbar from '../../components/navbar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { evidentirajPrisustvo } from "@/app/actions";
import AttendanceStats from '@/components/AttendanceStats'; 

export default async function StudentPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const success = params.success === "attended";
  
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;

  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const student = ulogovaniKorisnici[0];
  if (!student || student.role !== 'student') redirect('/login');

  // --- 1. LOGIKA ZA STATISTIKU (Računamo u odnosu na sve dodeljene termine) ---
  const sveMojeEvidencije = await db
    .select({ status: prisustvo.status })
    .from(prisustvo)
    .where(eq(prisustvo.korisnikId, student.id));

  // Ukupan broj termina na koje je student poslat (sva predavanja)
  const ukupnoPredavanja = sveMojeEvidencije.length;
  // Broj termina gde je status zapravo promenjen u 'Prisutan'
  const brojDolazaka = sveMojeEvidencije.filter(e => e.status === 'Prisutan').length;

  // --- 2. LOGIKA ZA TRENUTNO VREME I FILTRIRANJE ---
  const sad = new Date();
  const dani = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const danasnjiDan = dani[sad.getDay()]; 

  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'Europe/Belgrade' 
  });

  const terminiDanas = await db
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
    .where(
        and(
            eq(prisustvo.korisnikId, student.id),
            eq(raspored.danUNedelji, danasnjiDan)
        )
    );

  const aktivniTermini = terminiDanas.filter(termin => {
    const pocetak = termin.pocetak.slice(0, 5);
    const kraj = termin.kraj.slice(0, 5);
    return trenutnoVreme >= pocetak && trenutnoVreme <= kraj;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={student.ime} userRole={student.role} />

      {success && (
        <div className="max-w-4xl mx-auto px-6 mt-8">
          <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-bounce">
            <span className="font-black text-[10px] uppercase tracking-widest">✅ Prisustvo je uspešno evidentirano!</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* STATISTIKA: totalTerms su sva predavanja, attendedTerms su dolasci */}
        <AttendanceStats 
          totalTerms={ukupnoPredavanja} 
          attendedTerms={brojDolazaka} 
        />

        <div className="flex justify-between items-end mb-12 mt-16">
          <div>
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
              <span className="text-blue-600">Trenutno</span> Predavanje
            </h2>
            <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-[0.2em]">
              {danasnjiDan}, {trenutnoVreme}h
            </p>
          </div>
          <Link href="/student/profil" className="border-2 border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
            Profil
          </Link>
        </div>

        <div className="grid gap-6">
          {aktivniTermini.length === 0 ? (
            <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
               <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
                 Trenutno nemate aktivnih predavanja u rasporedu.
               </p>
            </div>
          ) : (
            aktivniTermini.map((termin) => (
              <div key={termin.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-blue-100 flex flex-col md:flex-row justify-between items-center transition-all hover:scale-[1.01]">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                    <span className="text-red-500 font-black text-[9px] uppercase tracking-widest">U toku je</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase">{termin.nazivPredmeta}</h3>
                  <p className="text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
                    Sala: {termin.kabinet} | {termin.pocetak.slice(0,5)} - {termin.kraj.slice(0,5)}
                  </p>
                </div>
                
                <div className="mt-8 md:mt-0">
                  <form action={evidentirajPrisustvo}>
                    <input type="hidden" name="korisnikId" value={student.id} />
                    <input type="hidden" name="rasporedId" value={termin.id} />
                    <button 
                      type="submit"
                      disabled={termin.statusPrisustva === 'Prisutan'}
                      className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {termin.statusPrisustva === 'Prisutan' ? 'Evidentirani ste' : 'Potvrdi Prisustvo'}
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
           <Link href="/kalendar" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors">
              Prikaži ceo nedeljni raspored →
           </Link>
        </div>
      </main>
    </div>
  );
}