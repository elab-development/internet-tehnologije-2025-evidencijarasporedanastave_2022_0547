import { db } from "@/db";
import { korisnik } from "@/db/schema";
import Navbar from '../../components/navbar';

export default async function StudentPage() {
  const ulogovanKorisnik = { ime: "Bogdan", role: "Student" };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {ulogovanKorisnik.role} Dashboard
          </span>
          <h2 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Tvoj <span className="text-blue-600">Raspored</span>!
          </h2>
        </div>

        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tighter italic uppercase">Elektronsko poslovanje</h3>
            <p className="text-blue-600 font-bold mb-10 text-xl italic">Danas | 14:00 - 16:00 | Sala 001</p>
            
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              <button className="bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-2xl transition-all uppercase text-sm">
                Potvrdi prisustvo (SK 9)
              </button>
              <button className="border-2 border-slate-100 text-slate-500 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                Google Calendar (SK 10)
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}