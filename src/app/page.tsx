import { db } from "@/db";
import { korisnik } from "@/db/schema";
import { dodajKorisnika } from "./actions"; // Uvezi akciju koju smo napravili
import Navbar from '../components/navbar';
import StatCard from '../components/statcard';
import CustomButton from '../components/CustomButton';

// Pošto koristimo bazu, Home postaje asinhrona Server Komponenta
export default async function HomePage() {
  // 1. Povuci prave korisnike iz baze
  const sviKorisniciIzBaze = await db.select().from(korisnik);

  // 2. Privremeno simuliramo ulogovanog (dok ne napraviš Auth)
  const ulogovanKorisnik = sviKorisniciIzBaze[0] || { ime: "Gost", role: "guest" };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {ulogovanKorisnik.role} Dashboard
          </span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Sistem je <span className="text-green-600">Povezan</span>!
          </h1>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-xl font-bold mb-4">Dodaj novog korisnika u bazu:</h2>
          <form action={dodajKorisnika} className="flex gap-4">
            <input 
              name="ime" 
              className="border p-2 rounded-lg flex-1" 
              placeholder="Ime i prezime" 
              required 
            />
            <input 
              name="email" 
              type="email" 
              className="border p-2 rounded-lg flex-1" 
              placeholder="Email" 
              required 
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Upiši u Postgres
            </button>
          </form>
        </div>

        <div className="grid gap-4 mb-10">
          <h2 className="text-2xl font-bold text-slate-800">Korisnici u PostgreSQL bazi:</h2>
          {sviKorisniciIzBaze.map((u) => (
            <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between">
              <span><strong>{u.ime}</strong> ({u.email})</span>
              <span className="text-slate-400 text-sm">Slug: {u.slug}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-2xl shadow-blue-100/50 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Sve radi kako treba?</h3>
            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">
              Ako vidiš imena iznad, tvoj Next.js backend uspešno komunicira sa Docker bazom.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}