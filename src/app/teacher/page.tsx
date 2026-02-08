import { db } from "@/db";
import { korisnik } from "@/db/schema";
import Navbar from '../../components/navbar';

export default async function TeacherPage() {
  const studentiIzBaze = await db.select().from(korisnik); // Kasnije filtriraj samo studente
  const ulogovanKorisnik = { ime: "Nastavnik", role: "Nastavnik" };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {ulogovanKorisnik.role} Dashboard
          </span>
          <h2 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Današnji <span className="text-green-600">Časovi</span>!
          </h2>
        </div>

        <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-8 text-slate-800 border-b pb-4 border-slate-50 italic">Evidencija prisustva studenata (SK 7):</h3>
          
          <div className="space-y-4">
            {studentiIzBaze.map((u) => (
              <div key={u.id} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-white transition-all">
                <div>
                  <h4 className="font-bold text-lg">{u.ime}</h4>
                  <p className="text-slate-400 text-xs italic">{u.email}</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 shadow-md">
                  Upiši prisustvo
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}