import { db } from "@/db";
import { raspored, predmet, prisustvo, korisnik } from "@/db/schema";
import { eq, and } from "drizzle-orm"; 
import Navbar from '../../components/navbar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { evidentirajPrisustvo } from "@/app/actions";
import AttendanceStats from '@/components/AttendanceStats'; 

async function getRandomQuote() {
  try {
    const res = await fetch('https://api.adviceslip.com/advice', { cache: 'no-store' });
    const data = await res.json();
    return data.slip.advice;
  } catch (error) {
    return "Uči naporno, uspeh će doći!";
  }
}

export default async function StudentPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams;
  const success = params.success === "true";
  
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail)).limit(1);
  const student = ulogovaniKorisnici[0];
  if (!student || student.role !== 'student') redirect('/login');

  const motivationQuote = await getRandomQuote();

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ulogovaniEmail)}`;

  const sad = new Date();
  
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { 
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Belgrade' 
  });

  const jsDan = sad.getDay(); 
  const danasnjiIndex = jsDan === 0 ? 7 : jsDan; 

  const naziviDanaZaPrikaz = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const imeDanasnjegDana = naziviDanaZaPrikaz[jsDan];

  const mapiranjeDana: Record<string, number> = {
    "ponedeljak": 1, "utorak": 2, "sreda": 3, "četvrtak": 4, "petak": 5, "subota": 6, "nedelja": 7,
  };

  const podaci = await db
    .select({ 
      id: raspored.id,
      dan: raspored.danUNedelji,
      pocetak: raspored.vremePocetka,
      kraj: raspored.vremeZavrsetka,
      nazivPredmeta: predmet.naziv,
      status: prisustvo.status,
    })
    .from(raspored)
    .innerJoin(predmet, eq(raspored.predmetId, predmet.id))
    .leftJoin(prisustvo, and(
      eq(prisustvo.rasporedId, raspored.id),
      eq(prisustvo.korisnikId, student.id)
    ));

  const odrzanaPredavanja = podaci.filter(p => {
    const danIzBaze = p.dan.toLowerCase().trim();
    const terminIndex = mapiranjeDana[danIzBaze] || 0;

    if (terminIndex < danasnjiIndex && terminIndex !== 0) return true;
    if (terminIndex === danasnjiIndex) {
      const pocetakTermina = p.pocetak.slice(0, 5);
      return trenutnoVreme >= pocetakTermina;
    }
    return false;
  });

  const brojDolazaka = odrzanaPredavanja.filter(p => p.status === 'Prisutan').length;
  const ukupnoOdrzano = odrzanaPredavanja.length;

  const aktivniTermini = podaci.filter(p => {
    const danIzBaze = p.dan.toLowerCase().trim();
    const terminIndex = mapiranjeDana[danIzBaze] || 0;
    if (terminIndex !== danasnjiIndex) return false;

    const pocetak = p.pocetak.slice(0, 5);
    const kraj = p.kraj.slice(0, 5);
    return trenutnoVreme >= pocetak && trenutnoVreme <= kraj;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={student.ime} userRole={student.role} />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        
        {/* SEKCIJA SA AVATAROM I CITATOM */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <img 
            src={avatarUrl} 
            alt="Student Avatar" 
            className="w-24 h-24 rounded-full bg-blue-50 border-2 border-blue-100 shadow-inner"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
              Dobrodošao nazad, <span className="text-blue-600">{student.ime}</span>
            </h1>
            <div className="mt-2 p-3 bg-slate-50 rounded-2xl border-l-4 border-blue-500">
              <p className="text-sm italic text-slate-600 font-medium">
                "{motivationQuote}"
              </p>
            </div>
          </div>
        </div>

        <AttendanceStats 
          totalHeldTerms={ukupnoOdrzano} 
          attendedTerms={brojDolazaka} 
        />

        <div className="flex justify-between items-end mb-12 mt-16">
            <div>
              <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
                <span className="text-blue-600">Aktivno</span> Predavanje
              </h2>
              <Link href="/student/profil" className="inline-block mt-4 border-2 border-slate-200 text-slate-600 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                Podešavanja Profila
              </Link>
            </div>
            <div className="text-right">
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                 Dan: {imeDanasnjegDana}
               </p>
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                 Vreme: {trenutnoVreme}h
               </p>
            </div>
        </div>

        <div className="grid gap-6">
          {aktivniTermini.length === 0 ? (
            <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-slate-100 text-center text-slate-300 font-black uppercase text-xs">
                 Nema predavanja u toku.
            </div>
          ) : (
            aktivniTermini.map((termin) => (
              <div key={termin.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-100 flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-black text-slate-800 uppercase leading-tight">{termin.nazivPredmeta}</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px]">U toku: {termin.pocetak.slice(0,5)} - {termin.kraj.slice(0,5)}</p>
                </div>
                
                <form action={evidentirajPrisustvo}>
                  <input type="hidden" name="korisnikId" value={student.id} />
                  <input type="hidden" name="rasporedId" value={termin.id} />
                  <button 
                    disabled={termin.status === 'Prisutan'}
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:bg-slate-100 disabled:text-slate-400 shadow-lg shadow-blue-200"
                  >
                    {termin.status === 'Prisutan' ? '✅ Potvrđeno' : 'Potvrdi Prisustvo'}
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}