"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


import Navbar from '../components/navbar';
import StatCard from '../components/statcard';
import CustomButton from '../components/CustomButton';
import { korisnici } from '../lib/podacifront/korisnici';
import { prisustva } from '../lib/podacifront/prisustva';
import { rasporedi } from '../lib/podacifront/rasporedi';
import { predmeti } from '../lib/podacifront/predmeti';

export default function HomePage() {
  const router = useRouter();
  
  // 1. Podaci o ulogovanom korisniku 
  const ulogovanKorisnik = korisnici.find(k => k.id === 3) || korisnici[2];

  // --- STATES ZA FUNKCIONALNOSTI ---
  const [procenatPrisustva, setProcenatPrisustva] = useState<number>(0);
  const [brojPredmetaDanas, setBrojPredmetaDanas] = useState<number>(0);
  const [sledeciPredmetInfo, setSledeciPredmetInfo] = useState<string>("Nema više predavanja");
  const [statusNaloga, setStatusNaloga] = useState<{ tekst: string, boja: string }>({ 
    tekst: "PROVERA...", 
    boja: "text-slate-500" 
  });

  useEffect(() => {
    // --- FUNKCIONALNOST 1: Kalkulacija procenta prisustva iz modela ---
    // Filtriramo prisustva samo za Nikolu (id: 3)
    const mojaPrisustva = prisustva.filter(p => p.korisnikId === ulogovanKorisnik.id);
    const brojPrisutan = mojaPrisustva.filter(p => p.status === "PRISUTAN").length;
    
    const procenat = mojaPrisustva.length > 0 
      ? Math.round((brojPrisutan / mojaPrisustva.length) * 100) 
      : 0;
    
    setProcenatPrisustva(procenat);

    // --- FUNKCIONALNOST 2: Određivanje statusa naloga na osnovu podataka ---
    if (procenat >= 90) {
        setStatusNaloga({ tekst: "ODLIČAN", boja: "text-green-600" });
    } else if (procenat >= 50) {
        setStatusNaloga({ tekst: "AKTIVAN", boja: "text-blue-600" });
    } else {
        setStatusNaloga({ tekst: "KRITIČAN", boja: "text-red-600" });
    }

    // --- FUNKCIONALNOST 3: Obrada rasporeda za današnji dan ---
    const daniUNedelji = ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"];
    const danasnjiDanIme = daniUNedelji[new Date().getDay()];

    // Filtriramo raspored za danas
    const danasnjiRaspored = rasporedi.filter(r => r.dan_u_nedelji === danasnjiDanIme);
    setBrojPredmetaDanas(danasnjiRaspored.length);

    // Pronalazimo naziv sledećeg predmeta spajanjem 'rasporedi' i 'predmeti'
    if (danasnjiRaspored.length > 0) {
        const prviSledeci = danasnjiRaspored[0];
        const predmetPodaci = predmeti.find(p => p.id === prviSledeci.predmetId);
        if (predmetPodaci) {
            setSledeciPredmetInfo(`${predmetPodaci.naziv} u ${prviSledeci.vreme_pocetka}h`);
        }
    }
  }, [ulogovanKorisnik.id]);

  return (
    <div className="min-h-screen bg-slate-50">
      
      <Navbar userName={ulogovanKorisnik.ime} />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            {ulogovanKorisnik.role} Dashboard
          </span>
          <h1 className="text-5xl font-black text-slate-900 mt-6 tracking-tight">
            Dobrodošli nazad, <span className="text-blue-600">{ulogovanKorisnik.ime.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            Vaš centralni sistem za evidenciju prisustva na FON-u.
          </p>
        </div>

    
        <div className="flex flex-wrap justify-center gap-6 mb-20">
          <StatCard 
            title="Predmeti Danas" 
            value={brojPredmetaDanas.toString()} 
            description={sledeciPredmetInfo} 
          />
          <StatCard 
            title="Ukupno Prisustvo" 
            value={`${procenatPrisustva}%`} 
            description={procenatPrisustva > 80 ? "Odličan prosek!" : "Pratite predavanja redovnije."} 
          />
          <StatCard 
            title="Status Naloga" 
            value={statusNaloga.tekst} 
            description="Zimski semestar 2024" 
          />
        </div>

       
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center shadow-2xl shadow-blue-100/50 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Vreme je za nastavu?</h3>
            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg">
              Pregledajte vaš kompletan nedeljni raspored i evidentirajte prisustvo.
            </p>
            <CustomButton 
              label="Otvori kalendar nastave →" 
              onClick={() => router.push('/kalendar')} 
            />
          </div>
          
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        </div>
      </main>
    </div>
  );
}