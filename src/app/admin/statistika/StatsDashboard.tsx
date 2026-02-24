'use client';
import { useState, useEffect } from 'react';
import { Chart } from "react-google-charts";

interface StatsProps {
  userStats: any[][];
  scheduleStats: any[][];
}

export default function StatsDashboard({ userStats, scheduleStats }: StatsProps) {
  // TRIK ZA HYDRATION: Proveravamo da li je komponenta montirana u browseru
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Dok se ne ucita u browseru, prikazujemo prazan prostor ili loader
  if (!isMounted) {
    return <div className="p-10 text-center font-bold text-slate-400 uppercase text-xs tracking-widest">Učitavanje analitike...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
      {/* PIE CHART */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-[0.2em] text-center">Struktura korisnika</h3>
        <Chart
          chartType="PieChart"
          data={userStats}
          options={{
            pieHole: 0.4,
            colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'],
            legend: { position: 'bottom' },
            backgroundColor: 'transparent'
          }}
          width="100%"
          height="300px"
        />
      </div>

      {/* BAR CHART */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-[0.2em] text-center">Broj termina po danima</h3>
        <Chart
          chartType="BarChart"
          data={scheduleStats}
          options={{
            colors: ['#3b82f6'],
            legend: { position: 'none' },
            backgroundColor: 'transparent'
          }}
          width="100%"
          height="300px"
        />
      </div>
    </div>
  );
}