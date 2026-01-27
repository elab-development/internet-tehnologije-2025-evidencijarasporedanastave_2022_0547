"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import { rasporedi } from '../../lib/podacifront/rasporedi';
import { predmeti } from '../../lib/podacifront/predmeti';
import { korisnici } from '../../lib/podacifront/korisnici';
import { prisustva } from '../../lib/podacifront/prisustva';

export default function KalendarPage() {
  const ulogovanKorisnik = korisnici[2]; // Nikola
  
  // --- FUNKCIONALNOST 4: Pretraga i filtriranje rasporeda ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filtriranRaspored, setFiltriranRaspored] = useState(rasporedi);

  useEffect(() => {
    const rezultati = rasporedi.filter(r => {
      // Pronalazimo naziv predmeta za ovaj termin u rasporedu
      const nazivPredmeta = predmeti.find(p => p.id === r.predmetId)?.naziv.toLowerCase() || "";
      return nazivPredmeta.includes(searchTerm.toLowerCase());
    });
    setFiltriranRaspored(rezultati);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userName={ulogovanKorisnik.ime} />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 mb-8">Raspored Nastave</h1>

        {/* Search Bar - Deo funkcionalnosti pretrage */}
        <div className="mb-8 relative">
          <input 
            type="text"
            placeholder="Pretraži predmet (npr. Internet Tehnologije)..."
            className="w-full p-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute right-4 top-4 opacity-30">🔍</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtriranRaspored.map((termin) => {
            const predmet = predmeti.find(p => p.id === termin.predmetId);
            return (
              <div key={termin.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {termin.dan_u_nedelji}
                  </span>
                  <span className="text-slate-400 text-sm font-mono">{termin.vreme_pocetka} - {termin.vreme_zavrsetka}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{predmet?.naziv}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{predmet?.opis}</p>
                
                <button className="w-full bg-slate-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">
                  Evidentiraj prisustvo
                </button>
              </div>
            );
          })}
        </div>

        {filtriranRaspored.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            Nema rezultata za vašu pretragu.
          </div>
        )}
      </main>
    </div>
  );
}