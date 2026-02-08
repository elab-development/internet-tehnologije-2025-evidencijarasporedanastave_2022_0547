

import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { dodajKorisnika } from "../actions"; 
import Navbar from '../../components/navbar';


export default async function AdminPage() {
  const sviKorisniciIzBaze = await db.select().from(korisnik);
  // Simulacija admina (kasnije ide pravi Auth)
  const ulogovanKorisnik = { ime: "Admin", role: "Administrator" };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {ulogovanKorisnik.role} Dashboard
          </span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Upravljanje <span className="text-red-600">Sistemom</span>
          </h1>
        </div>

        {/* SK 3 & SK 10: Forma za upravljanje korisnicima */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-xl font-bold mb-4 italic text-slate-700">Dodaj novog korisnika (Student/Nastavnik):</h2>
          <form action={dodajKorisnika} className="flex gap-4">
            <input name="ime" className="border p-2 rounded-lg flex-1" placeholder="Ime i prezime" required />
            <input name="email" type="email" className="border p-2 rounded-lg flex-1" placeholder="Email" required />
            <button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-bold uppercase text-xs">
              Upiši u Bazu
            </button>
          </form>
        </div>

        {/* SK 6: Pregled svih korisnika */}
        <div className="grid gap-4">
          <h2 className="text-2xl font-bold text-slate-800 mb-2 italic">Registrovani korisnici u sistemu:</h2>
          {sviKorisniciIzBaze.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
              <span className="text-slate-700"><strong>{u.ime}</strong> <span className="text-slate-400 text-sm ml-2">{u.email}</span></span>
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-md text-xs font-mono uppercase tracking-tighter">role: {u.role || 'user'}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}