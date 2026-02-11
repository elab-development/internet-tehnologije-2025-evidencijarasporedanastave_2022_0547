import { db } from "@/db";
import { raspored, predmet, prisustvo, korisnik } from "@/db/schema";
import { eq, and } from "drizzle-orm"; 
import Navbar from '../../components/navbar';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { evidentirajPrisustvo } from "@/app/actions";
import AttendanceStats from '@/components/AttendanceStats'; 

export default async function StudentPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams;
  const success = params.success === "true";
  
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail)).limit(1);
  const student = ulogovaniKorisnici[0];
  if (!student || student.role !== 'student') redirect('/login');

  // --- 1. DOBIJANJE TRENUTNOG VREMENA (SRBIJA) ---
  const sad = new Date();
  
  // Sat i minut (npr. "14:30")
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { 
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Belgrade' 
  });

  // Dobijanje dana u nedelji kao broj (1 = Ponedeljak, ..., 7 = Nedelja)
  // JS getDay() daje: 0 za Nedelju, 1 za Pon, 2 za Uto...
  const jsDan = sad.getDay(); 
  const danasnjiIndex = jsDan === 0 ? 7 : jsDan; 

  // Mapiranje naziva dana iz baze u brojeve radi poređenja
  const mapiranjeDana: Record<string, number> = {
    "ponedeljak": 1, "utorak": 2, "sreda": 3, "četvrtak": 4, "petak": 5, "subota": 6, "nedelja": 7,
    "ponedjeljak": 1, "srijeda": 3, "cetvrtak": 4 // dodato za svaki slučaj
  };

  // --- 2. PODACI IZ BAZE ---
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

  // --- 3. LOGIKA ZA FILTRIRANJE ODRŽANIH PREDAVANJA ---
  const odrzanaPredavanja = podaci.filter(p => {
    // Normalizujemo naziv dana iz baze (mala slova, bez razmaka)
    const danIzBaze = p.dan.toLowerCase().trim();
    const terminIndex = mapiranjeDana[danIzBaze] || 0;

    // DEBUG (vidi ovo u terminalu gde si pokrenuo npm run dev)
    // console.log(`Provera termina: ${p.nazivPredmeta}, Dan: ${danIzBaze}(${terminIndex}), Danas: ${danasnjiIndex}`);

    // Ako je dan u nedelji prošao
    if (terminIndex < danasnjiIndex && terminIndex !== 0) return true;

    // Ako je dan isti kao danasnji, proveri vreme pocetka
    if (terminIndex === danasnjiIndex) {
      const pocetakTermina = p.pocetak.slice(0, 5);
      return trenutnoVreme >= pocetakTermina;
    }

    return false;
  });

  const brojDolazaka = odrzanaPredavanja.filter(p => p.status === 'Prisutan').length;
  const ukupnoOdrzano = odrzanaPredavanja.length;

  // Aktivna (trenutno u toku)
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
        
        <AttendanceStats 
          totalHeldTerms={ukupnoOdrzano} 
          attendedTerms={brojDolazaka} 
        />

        <div className="flex justify-between items-end mb-12 mt-16">
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">
              <span className="text-blue-600">Aktivno</span> Predavanje
            </h2>
            <div className="text-right">
               <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Danas je index: {danasnjiIndex}
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
                    className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:bg-slate-100 disabled:text-slate-400"
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