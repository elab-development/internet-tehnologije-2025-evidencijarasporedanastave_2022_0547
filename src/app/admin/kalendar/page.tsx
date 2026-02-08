import { db } from "@/db";
import { raspored, predmet, korisnik } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { adminDodajRaspored } from "@/app/actions";
import DeleteScheduleButton from "@/components/DeleteScheduleButton";

export default async function AdminCalendarPage() {
  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;

  if (!ulogovaniEmail) redirect('/login');

  const ulogovani = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail)).limit(1);
  if (!ulogovani[0] || ulogovani[0].role !== 'admin') redirect('/login');

  // 1. Dohvatanje svih predmeta za dropdown meni
  const sviPredmeti = await db.select().from(predmet).orderBy(asc(predmet.naziv));

  // 2. Dohvatanje celokupnog rasporeda
  const savRaspored = await db
    .select({
      id: raspored.id,
      dan: raspored.danUNedelji,
      pocetak: raspored.vremePocetka,
      kraj: raspored.vremeZavrsetka,
      kabinet: raspored.kabinet,
      predmetNaziv: predmet.naziv,
    })
    .from(raspored)
    .innerJoin(predmet, eq(raspored.predmetId, predmet.id))
    .orderBy(asc(raspored.vremePocetka));

  const radniDani = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Navbar userName={ulogovani[0].ime} userRole={ulogovani[0].role} />

      <main className="max-w-7xl mx-auto px-6 py-16">
        
        {/* NASLOV I KOMANDA NAZAD */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Upravljanje <span className="text-red-600">Rasporedom</span>
            </h1>
            <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest">
              Sistemski nivo kontrole i evidencije nastave
            </p>
          </div>
          <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest bg-white border-2 border-slate-200 px-6 py-3 rounded-2xl hover:border-red-600 hover:text-red-600 transition-all shadow-sm">
            ← Dashboard
          </Link>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-16">
          <h2 className="text-xl font-black mb-8 uppercase tracking-tight text-slate-800 flex items-center gap-3">
             <span className="bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-xl text-lg font-bold shadow-lg shadow-red-100">+</span>
             Novi termin nastave
          </h2>
          
          <form action={adminDodajRaspored} className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Predmet</label>
              <select name="predmetId" className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold text-xs transition-all appearance-none cursor-pointer" required>
                <option value="">Odaberi...</option>
                {sviPredmeti.map(p => <option key={p.id} value={p.id}>{p.naziv}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Dan</label>
              <select name="dan" className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold text-xs transition-all appearance-none cursor-pointer">
                {radniDani.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Sala / Kabinet</label>
              <input name="kabinet" placeholder="Npr. 201 ili A1" className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold text-xs transition-all" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Vreme (HH:mm)</label>
              <div className="flex gap-2">
                <input name="pocetak" type="time" className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold text-xs flex-1 transition-all" required />
                <input name="kraj" type="time" className="p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold text-xs flex-1 transition-all" required />
              </div>
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-slate-200">
                Upiši u raspored
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {radniDani.map((dan) => {
            const terminiZaDan = savRaspored.filter((r) => r.dan === dan);
            
            return (
              <div key={dan} className="flex flex-col gap-6">
                <div className="border-b-4 border-slate-900 pb-2 flex justify-between items-end px-2">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">{dan}</h3>
                  <span className="text-[10px] font-black text-slate-300">{terminiZaDan.length}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {terminiZaDan.length === 0 ? (
                    <div className="bg-white/40 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Nema časova</span>
                    </div>
                  ) : (
                    terminiZaDan.map((t) => (
                      <div key={t.id} className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 group relative transition-all hover:border-red-200 hover:scale-[1.02]">
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                            <span className="text-[10px] font-black tracking-tighter">
                              {t.pocetak.slice(0, 5)} - {t.kraj.slice(0, 5)}
                            </span>
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-[-5px] group-hover:translate-y-0">
                            <Link href={`/admin/kalendar/izmeni/${t.id}`} className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm" title="Izmeni">
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </Link>
                            
                            <DeleteScheduleButton id={t.id} />
                          </div>
                        </div>

                        <h4 className="font-black text-slate-800 text-xs uppercase leading-tight mb-4 min-h-[2rem]">{t.predmetNaziv}</h4>
                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black">
                           <span className="text-slate-300 uppercase tracking-widest italic text-[8px]">Sala</span>
                           <span className="text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md">{t.kabinet}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}