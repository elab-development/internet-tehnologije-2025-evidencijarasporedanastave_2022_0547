import { db } from "@/db";
import { raspored, predmet, korisnik } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function KalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
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

  const query = (await searchParams).q || "";

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
    .where(query ? ilike(predmet.naziv, `%${query}%`) : undefined);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* KLJUČNA IZMENA: Prosleđujemo i userName i userRole da bi navigacija radila */}
      <Navbar userName={korisnikPodaci.ime} userRole={korisnikPodaci.role} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Raspored Nastave</h1>

        <form className="mb-8 relative">
          <input 
            name="q"
            type="text"
            defaultValue={query}
            placeholder="Pretraži predmet (npr. Internet Tehnologije)..."
            className="w-full p-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          />
          <button type="submit" className="absolute right-4 top-4 opacity-30 hover:opacity-100 transition-opacity">
            🔍
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rezultatiIzBaze.map((termin) => (
            <div key={termin.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-md hover:shadow-lg transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {termin.dan_u_nedelji}
                </span>
                <span className="text-slate-400 text-xs font-mono font-bold">
                  {termin.vreme_pocetka.slice(0, 5)} - {termin.vreme_zavrsetka.slice(0, 5)}
                </span>
              </div>
              
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                {termin.naziv}
              </h3>
              
              <p className="text-slate-500 text-sm mb-4 line-clamp-2 italic font-medium">
                {termin.opis || "Nema opisa za ovaj predmet."}
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  Sala: {termin.kabinet || "N/A"}
                </span>
                <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg">
                  Evidentiraj
                </button>
              </div>
            </div>
          ))}
        </div>

        {rezultatiIzBaze.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-[0.2em] text-xs">
              {query ? `Nema rezultata za pretragu: "${query}"` : "Trenutno nema predmeta u bazi."}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}