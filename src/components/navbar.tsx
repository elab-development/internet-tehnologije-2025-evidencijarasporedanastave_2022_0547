"use client";
import React from 'react';
import Link from 'next/link';
import CustomButton from './CustomButton';
import { logoutAkcija } from '@/app/actions'; // Uvezi svoju logout akciju

interface NavbarProps {
  userName: string;
  userRole?: string; 
}

const Navbar = ({ userName, userRole }: NavbarProps) => {
  // Normalizujemo ulogu za proveru
  const role = userRole?.toLowerCase().trim();

  // Dinamičke putanje na osnovu uloge
  const homePath = 
    (role === 'student') ? '/student' : 
    (role === 'admin') ? '/admin' : 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher' : '/';

  // Ako je nastavnik ide na /teacher/kalendar, svi ostali idu na običan /kalendar
  const calendarPath = 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher/kalendar' : '/kalendar';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <Link href={homePath} className="text-xl font-black text-blue-600 tracking-tighter">
        EVENT.FON
      </Link>
      
      <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link href={homePath} className="hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
          Početna
        </Link>
        
        <Link href={calendarPath} className="hover:text-blue-600 transition-colors font-bold uppercase text-[10px] tracking-widest">
          Kalendar
        </Link>
        
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Profil:</span>
          <span className="font-bold text-slate-800 text-xs">{userName || "Korisnik"}</span>
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