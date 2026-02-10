import { db } from "@/db";
import { raspored, predmet, korisnik } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminAzurirajRaspored } from "@/app/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { cookies } from "next/headers";

export default async function EditSchedulePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const id = (await params).id;

  const cookieStore = await cookies();
  const ulogovaniEmail = cookieStore.get('user_email')?.value;
  const ulogovani = await db.select().from(korisnik).where(eq(korisnik.email, ulogovaniEmail || "")).limit(1);
  
  if (!ulogovani[0] || ulogovani[0].role !== 'admin') redirect('/login');

  const termin = await db
    .select({
      id: raspored.id,
      dan: raspored.danUNedelji,
      pocetak: raspored.vremePocetka,
      kraj: raspored.vremeZavrsetka,
      kabinet: raspored.kabinet,
      predmetNaziv: predmet.naziv
    })
    .from(raspored)
    .innerJoin(predmet, eq(raspored.predmetId, predmet.id))
    .where(eq(raspored.id, id))
    .limit(1);

  const t = termin[0];
  if (!t) redirect("/admin/kalendar");

  const dani = ["Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak"];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar userName={ulogovani[0].ime} userRole={ulogovani[0].role} />
      
      <main className="max-w-2xl mx-auto px-6 py-20">
        <div className="mb-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
            Izmeni <span className="text-red-600">Termin</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-widest">
            Menjate vreme ili salu za predmet: {t.predmetNaziv}
          </p>
        </div>
        
        <form action={adminAzurirajRaspored} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-6">
          <input type="hidden" name="id" value={t.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dan</label>
              <select 
                name="dan" 
                defaultValue={t.dan ?? "Ponedeljak"} 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all appearance-none cursor-pointer"
              >
                {dani.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Kabinet / Sala</label>
              <input 
                name="kabinet" 
                defaultValue={t.kabinet ?? ""} 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Vreme Početka</label>
              <input 
                name="pocetak" 
                type="time" 
                defaultValue={t.pocetak?.slice(0, 5) ?? ""} 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Vreme Završetka</label>
              <input 
                name="kraj" 
                type="time" 
                defaultValue={t.kraj?.slice(0, 5) ?? ""} 
                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-red-600 focus:bg-white outline-none font-bold transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link 
              href="/admin/kalendar" 
              className="text-center bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center"
            >
              ← Odustani
            </Link>

            <button 
              type="submit" 
              className="bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
            >
              Sačuvaj Promene
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}