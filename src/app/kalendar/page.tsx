import { db } from "@/db";
import { raspored, predmet, korisnik } from "@/db/schema";
import { eq, ilike, asc } from "drizzle-orm";
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { evidentirajPrisustvo } from "@/app/actions";

export default async function KalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const success = params.success;
  const query = params.q || "";

  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const korisnikPodaci = ulogovaniKorisnici[0];
  if (!korisnikPodaci) redirect('/login');

  // LOGIKA ZA VREME I DAN
  const sad = new Date();
  const dani = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const trenutniDan = dani[sad.getDay()].toLowerCase().trim();
  
  // Dobijamo format HH:mm (npr. "13:18")
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'Europe/Belgrade' 
  });

  const rezultatiIzBaze = await db
    .select({
      id: raspored.id,
      dan_u_nedelji: raspored.danUNedelji,
      vreme_pocetka: raspored.vremePocetka,
      vreme_zavrsetka: raspored.vremeZavrsetka,
      naziv: predmet.naziv,
      opis: predmet.opis,
      kabinet: raspored.kabinet
    })
    .from(raspored)
    .innerJoin(predmet, eq(raspored.predmetId, predmet.id))
    .where(query ? ilike(predmet.naziv, `%${query}%`) : undefined)
    .orderBy(asc(raspored.danUNedelji), asc(raspored.vremePocetka));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={korisnikPodaci.ime} userRole={korisnikPodaci.role} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Raspored Nastave</h1>

        {/* NOTIFIKACIJE */}
        <div className="mb-8 space-y-4">
          {success === "attended" && (
            <div className="bg-emerald-500 text-white p-5 rounded-[2rem] shadow-xl flex items-center gap-4">
              <span className="text-xl">✅</span>
              <p className="font-bold uppercase text-xs tracking-tight">Prisustvo evidentirano!</p>
            </div>
          )}
          {error === "not_in_time" && (
            <div className="bg-amber-500 text-white p-5 rounded-[2rem] shadow-xl flex items-center gap-4">
              <span className="text-xl">⏰</span>
              <p className="font-bold uppercase text-xs tracking-tight">Predavanje nije u toku!</p>
            </div>
          )}
        </div>

        {/* PRETRAGA */}
        <form className="mb-12 relative">
          <input 
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Pretraži predmet..."
            className="w-full p-5 rounded-3xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
          />
        </form>

        {/* KARTICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rezultatiIzBaze.map((termin) => {
            // NORMALIZACIJA DANA
            const danIzBaze = termin.dan_u_nedelji.toLowerCase().trim();
            
            // NORMALIZACIJA VREMENA (da isečemo sekunde npr. 13:18:03 -> 13:18)
            const pocetak = termin.vreme_pocetka.slice(0, 5);
            const kraj = termin.vreme_zavrsetka.slice(0, 5);

            // PROVERA AKTIVNOSTI
            const jeAktivno = danIzBaze === trenutniDan && 
                             trenutnoVreme >= pocetak && 
                             trenutnoVreme <= kraj;

            return (
              <div 
                key={termin.id} 
                className={`relative bg-white p-8 rounded-[2.5rem] border transition-all flex flex-col ${
                  jeAktivno ? 'border-blue-500 ring-4 ring-blue-50 shadow-2xl' : 'border-slate-100'
                }`}
              >
                {jeAktivno && (
                  <span className="absolute -top-3 left-8 bg-blue-600 text-white text-[9px] font-black px-4 py-1 rounded-full tracking-tighter uppercase animate-pulse">
                    Trenutno u toku
                  </span>
                )}

                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    jeAktivno ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {termin.dan_u_nedelji}
                  </span>
                  <span className="text-slate-400 text-xs font-mono font-bold">
                    {pocetak} - {kraj}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight">
                  {termin.naziv}
                </h3>
                
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 italic font-medium">
                  {termin.opis || "Nema opisa za ovaj predmet."}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                  <div className="flex flex-col">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Lokacija</span>
                     <span className="text-[11px] font-black text-slate-900 uppercase">Sala: {termin.kabinet || "N/A"}</span>
                  </div>

                  <form action={evidentirajPrisustvo}>
                    <input type="hidden" name="korisnikId" value={korisnikPodaci.id} />
                    <input type="hidden" name="rasporedId" value={termin.id} />
                    <button 
                      type="submit"
                      disabled={!jeAktivno}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                        jeAktivno 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                        : 'bg-slate-300 text-white opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {jeAktivno ? "Evidentiraj" : "Zatvoreno"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}