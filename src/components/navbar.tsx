"use client";
import React from 'react';
import Link from 'next/link';
import CustomButton from './CustomButton';
import { logoutAkcija } from '@/app/actions'; 

interface NavbarProps {
  userName: string;
  userRole?: string; 
}

const Navbar = ({ userName, userRole }: NavbarProps) => {
  // 1. Normalizujemo ulogu za proveru
  const role = userRole?.toLowerCase().trim();

  // 2. Definisanje putanje za Početnu stranu
  const homePath = 
    role === 'student' ? '/student' : 
    role === 'admin' ? '/admin' : 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher' : '/';

  // 3. Definisanje putanje za Kalendar (Samo jedna deklaracija!)
  const calendarPath = 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher/kalendar' : 
    role === 'admin' ? '/admin/kalendar' : 
    '/kalendar'; // Putanja za studente i ostale

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      {/* Logo vodi na homePath */}
      <Link href={homePath} className="text-xl font-black text-blue-600 tracking-tighter hover:scale-105 transition-transform">
        EVENT.FON
      </Link>
      
      <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
        
        <Link href={homePath} className="hover:text-blue-600 transition-colors font-black uppercase text-[10px] tracking-widest">
          Početna
        </Link>
        
        <Link href={calendarPath} className="hover:text-blue-600 transition-colors font-black uppercase text-[10px] tracking-widest">
          Kalendar
        </Link>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <span className="text-[9px] font-black uppercase text-slate-400 mr-1">Status:</span>
          <span className="font-bold text-slate-800 text-xs">
            {userName || "Učitavanje..."}
          </span>
          {/* Opciono: mali indikator uloge */}
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
        </div>
        
        <CustomButton 
          label="Odjavi se" 
          variant="danger" 
          onClick={async () => {
            await logoutAkcija();
            window.location.href = "/login";
          }} 
        />
      </div>
    </nav>
  );
};

export default Navbar;