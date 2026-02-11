'use client';

import { useState, useEffect } from 'react';

interface StatsProps {
  totalTerms: number;
  attendedTerms: number;
}

export default function AttendanceStats({ totalTerms, attendedTerms }: StatsProps) {
  const [percentage, setPercentage] = useState(0);
  const realPercentage = totalTerms > 0 ? Math.round((attendedTerms / totalTerms) * 100) : 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPercentage(realPercentage);
    }, 500);
    return () => clearTimeout(timeout);
  }, [realPercentage]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tvoja statistika</p>
          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ukupno prisustvo</h4>
        </div>
        <span className={`text-4xl font-black ${percentage > 75 ? 'text-emerald-500' : 'text-amber-500'}`}>
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
        Evidentirano {attendedTerms} od ukupno {totalTerms} termina
      </p>
    </div>
  );
}