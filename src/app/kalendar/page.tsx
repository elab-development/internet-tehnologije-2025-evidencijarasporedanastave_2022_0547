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
  // 1. Priprema parametara i provera sesije
  const params = await searchParams;
  const error = params.error;
  const success = params.success;
  const query = params.q || "";

  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  if (!ulogovaniEmail) redirect('/login');

  // 2. Provera korisnika u bazi
  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const korisnikPodaci = ulogovaniKorisnici[0];
  if (!korisnikPodaci) redirect('/login');

  // 3. Dobavljanje podataka za "Trenutno u toku" proveru
  const sad = new Date();
  const dani = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
  const trenutniDan = dani[sad.getDay()];
  const trenutnoVreme = sad.toLocaleTimeString('sr-RS', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // 4. Izvlačenje rasporeda iz baze sa sortiranjem
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

        {/* --- OBAVEŠTENJA (SUCCESS / ERROR) --- */}
        <div className="mb-8 space-y-4">
          {/* Poruka za USPEŠNU evidenciju */}
          {success === "attended" && (
            <div className="bg-emerald-500 text-white p-5 rounded-[2rem] shadow-xl shadow-emerald-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 transition-all">
              <div className="bg-white/20 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">Sistem potvrđuje</p>
                <p className="text-sm font-bold opacity-95">Tvoje prisustvo je uspešno evidentirano!</p>
              </div>
            </div>
          )}

          {/* Poruka za GREŠKU (Vreme) */}
          {error === "not_in_time" && (
            <div className="bg-amber-500 text-white p-5 rounded-[2rem] shadow-xl shadow-amber-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">⏰</span>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">Pristup odbijen</p>
                <p className="text-sm font-bold opacity-90">Evidencija nije moguća: Predavanje nije trenutno u toku!</p>
              </div>
            </div>
          )}

          {/* Poruka za GREŠKU (Baza/Duplikat) */}
          {error === "database_error" && (
            <div className="bg-red-500 text-white p-5 rounded-[2rem] shadow-xl shadow-red-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
              <span className="text-xl">❌</span>
              <div>
                <p className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">Greška</p>
                <p className="text-sm font-bold opacity-90">Došlo je do greške prilikom upisa ili ste se već prijavili.</p>
              </div>
            </div>
          )}
        </div>

        {/* Pretraga */}
        <form className="mb-12 relative">
          <input 
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Pretraži predmet (npr. Internet Tehnologije)..."
            className="w-full p-5 rounded-3xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-slate-900"
          />
          <button type="submit" className="absolute right-5 top-5 text-slate-400 hover:text-blue-600 transition-colors">
            🔍
          </button>
        </form>

        {/* Kartice sa rasporedom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rezultatiIzBaze.map((termin) => {
            // Provera da li je termin trenutno aktivan
            const jeAktivno = termin.dan_u_nedelji === trenutniDan && 
                             trenutnoVreme >= termin.vreme_pocetka.slice(0, 5) && 
                             trenutnoVreme <= termin.vreme_zavrsetka.slice(0, 5);

            return (
              <div 
                key={termin.id} 
                className={`relative bg-white p-8 rounded-[2.5rem] border transition-all group flex flex-col ${
                  jeAktivno ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100 hover:shadow-xl'
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
                  <span className="text-slate-400 text-xs font-mono font-bold bg-slate-50 px-3 py-1 rounded-lg">
                    {termin.vreme_pocetka.slice(0, 5)} - {termin.vreme_zavrsetka.slice(0, 5)}
                  </span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-800 mb-3 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                  {termin.naziv}
                </h3>
                
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 italic font-medium leading-relaxed">
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
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                        jeAktivno 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Evidentiraj
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {rezultatiIzBaze.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">
              {query ? `Nema rezultata za: "${query}"` : "Trenutno nema predmeta u bazi."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}