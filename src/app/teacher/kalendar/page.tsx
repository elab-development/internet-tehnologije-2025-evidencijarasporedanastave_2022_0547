import { db } from "@/db";
import { raspored, predmet, korisnik } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";

export default async function TeacherCalendarPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("user_email")?.value;

  if (!email) redirect("/login");

  const pronadjeni = await db
    .select()
    .from(korisnik)
    .where(eq(korisnik.email, email))
    .limit(1);

  const user = pronadjeni[0];
  if (!user || (user.role !== 'teacher' && user.role !== 'nastavnik')) {
    redirect("/login");
  }

  const mojiTermini = await db
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
    .where(eq(predmet.nastavnikId, user.id))
    .orderBy(asc(raspored.vremePocetka)); 

  const daniUNedelji = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={user.ime} userRole={user.role} />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Nedeljni <span className="text-blue-600">Raspored</span>
            </h1>
            <p className="text-slate-400 font-bold mt-3 uppercase text-[10px] tracking-[0.2em]">
              Pregled svih vaših predavanja i termina
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {daniUNedelji.map((dan) => {
            const terminiZaDan = mojiTermini.filter((r) => r.dan === dan);
            
            return (
              <div key={dan} className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 px-1">
                    <h3 className="font-black text-slate-800 uppercase text-[11px] tracking-widest">
                        {dan}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded-md">
                        {terminiZaDan.length}
                    </span>
                </div>
                
                <div className="flex flex-col gap-4">
                  {terminiZaDan.length === 0 ? (
                    <div className="py-10 px-2 border-2 border-dashed border-slate-100 rounded-[2rem] flex items-center justify-center">
                      <p className="text-[8px] text-slate-300 font-black uppercase tracking-tighter italic">Nema obaveza</p>
                    </div>
                  ) : (
                    terminiZaDan.map((termin) => (
                      <div 
                        key={termin.id} 
                        className="bg-white p-5 rounded-[1.8rem] shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                      >
                        <div className="bg-blue-50 text-blue-600 w-fit px-3 py-1 rounded-full mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <span className="text-[9px] font-black uppercase tracking-tight">
                              {termin.pocetak.slice(0,5)} — {termin.kraj.slice(0,5)}
                           </span>
                        </div>
                        
                        <h4 className="font-black text-slate-800 text-xs uppercase leading-tight min-h-[2rem]">
                          {termin.predmetNaziv}
                        </h4>
                        
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Sala</span>
                           <span className="text-[10px] font-black text-slate-700">{termin.kabinet}</span>
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