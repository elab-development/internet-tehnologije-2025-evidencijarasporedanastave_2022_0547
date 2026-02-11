import { db } from "@/db";
import { korisnik, predmet, raspored, prisustvo } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Navbar from '../../components/navbar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function TeacherPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;

  if (!ulogovaniEmail) redirect('/login');

  const ulogovaniKorisnici = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, ulogovaniEmail))
    .limit(1);
  
  const nastavnik = ulogovaniKorisnici[0];
  if (!nastavnik || (nastavnik.role !== 'teacher' && nastavnik.role !== 'nastavnik')) {
    redirect('/login');
  }

  const studentiStat = await db
    .select({ 
      total: sql<number>`cast(count(${korisnik.id}) as int)` 
    })
    .from(korisnik)
    .where(eq(korisnik.role, 'student'));
  
  const ukupnoStudenata = studentiStat[0]?.total || 1;

  const statistikaPredmeta = await db
    .select({
      id: predmet.id,
      naziv: predmet.naziv,
      opis: predmet.opis,
      ukupnoPrisustva: sql<number>`cast(count(${prisustvo.korisnikId}) as int)`,
      brojTermina: sql<number>`cast(count(distinct ${raspored.id}) as int)`,
    })
    .from(predmet)
    .leftJoin(raspored, eq(raspored.predmetId, predmet.id))
    .leftJoin(prisustvo, eq(prisustvo.rasporedId, raspored.id))
    .where(eq(predmet.nastavnikId, nastavnik.id))
    .groupBy(predmet.id, predmet.naziv, predmet.opis);

  const listaStudenata = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.role, 'student'));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={nastavnik.ime} userRole={nastavnik.role} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h2 className="text-5xl font-black tracking-tight uppercase">
            Moja <span className="text-blue-600">Statistika</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-[0.2em]">
            Prisustvo po predmetima na kojima ste angažovani
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {statistikaPredmeta.map((p) => {
            const maxMogucihDolazaka = ukupnoStudenata * (p.brojTermina || 1);
            const procenat = Math.round((p.ukupnoPrisustva / maxMogucihDolazaka) * 100) || 0;

            return (
              <div key={p.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-slate-800">{procenat}%</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Prisutnost</p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 leading-none">
                    {p.naziv}
                  </h3>
                  <p className="text-slate-400 text-xs font-medium leading-relaxed mb-8 line-clamp-2 italic">
                    {p.opis || "Nema dodatnog opisa."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Statistika dolazaka</span>
                    <span className="text-blue-600 font-bold">{p.ukupnoPrisustva} studenta</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${procenat > 50 ? 'bg-blue-600' : 'bg-rose-500'}`}
                      style={{ width: `${procenat}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                    {p.brojTermina} termina u nedeljnom kalendaru
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-10 pb-4 border-b">
            Registar Studenata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {listaStudenata.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-600 text-[10px]">
                  {s.ime.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-slate-800 text-xs truncate">{s.ime}</h4>
                  <p className="text-slate-400 text-[9px] font-black truncate uppercase">{s.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}