"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/navbar';
import StatCard from '../components/statcard';
import CustomButton from '../components/CustomButton';
import { korisnici } from '../lib/podacifront/korisnici';

export default function HomePage() {
  const router = useRouter();
  const ulogovanKorisnik = korisnici[2]; // Nikola (Student)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Student Dashboard
          </span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Dobrodošli nazad, <span className="text-blue-600">{ulogovanKorisnik.ime.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            Vaš centralni sistem za evidenciju prisustva na predavanjima i vežbama.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-20">
          <StatCard title="Predmeti Danas" value="3" description="Sledeći: IT u 12:00h" />
          <StatCard title="Ukupno Prisustvo" value="94%" description="Odličan prosek!" />
          <StatCard title="Status Naloga" value="AKTIVAN" description="Zimski semestar 2024" />
        </div>

        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-2xl shadow-blue-100/50 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Vreme je za nastavu?</h3>
            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">
              Otvorite kalendar da vidite današnje predmete i evidentirate svoje prisustvo jednim klikom.
            </p>
            <CustomButton 
              label="Otvori današnji kalendar →" 
              onClick={() => router.push('/kalendar')} 
            />
          </div>
          {/* Dekorativni krug u pozadini */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </main>
    </div>
  );
}