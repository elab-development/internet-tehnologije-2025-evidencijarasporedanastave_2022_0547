'use client';

import { useState, useEffect } from 'react';

interface StatsProps {
  // totalHeldTerms - broj predavanja koja su se do sada održala
  totalHeldTerms: number; 
  // attendedTerms - broj predavanja na kojima je student bio
  attendedTerms: number;
}

export default function AttendanceStats({ totalHeldTerms, attendedTerms }: StatsProps) {
  const [percentage, setPercentage] = useState(0);

  // LOGIKA: Ako je prošlo 5 predavanja (totalHeldTerms), a student bio na 4 (attendedTerms),
  // procenat će biti 80%. Ako je bio na 5 od 5, biće 100%.
  // Ako je prošlo predavanje a on nije evidentiran, totalHeldTerms raste, 
  // a attendedTerms ostaje isti -> procenat opada.
  
  const realPercentage = totalHeldTerms > 0 
    ? Math.round((attendedTerms / totalHeldTerms) * 100) 
    : 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPercentage(realPercentage);
    }, 500);
    return () => clearTimeout(timeout);
  }, [realPercentage]);

  // Boja se menja: 100% je zeleno, sve ispod je narandžasto/crveno (opciono)
  const getStatusColor = () => {
    if (percentage === 100) return 'text-emerald-500';
    if (percentage >= 75) return 'text-blue-500';
    return 'text-amber-500';
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tvoja statistika</p>
          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ukupno prisustvo</h4>
        </div>
        <span className={`text-4xl font-black transition-colors duration-500 ${getStatusColor()}`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Prisutan: {attendedTerms} / Odžano: {totalHeldTerms} predavanja
      </p>

      {percentage < 100 && (
        <p className="mt-1 text-[9px] text-rose-500 font-bold uppercase italic">
          * Imate neevidentirane izostanke
        </p>
      )}
    </div>
  );
}