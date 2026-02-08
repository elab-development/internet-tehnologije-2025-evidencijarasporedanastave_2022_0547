"use client";
import React from 'react';
import Link from 'next/link';
import CustomButton from './CustomButton';

interface NavbarProps {
  userName: string;
  userRole?: string; 
}

const Navbar = ({ userName, userRole }: NavbarProps) => {
  // Normalizujemo ulogu (mala slova i čišćenje razmaka)
  const role = userRole?.toLowerCase().trim();

  // Putanja za početnu stranu
  const homePath = 
    (role === 'student') ? '/student' : 
    (role === 'admin' || role === 'administrator') ? '/admin' : 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher' : '/';

  // NOVA LOGIKA: Putanja za kalendar zavisi od uloge
  // Ako je nastavnik, šaljemo ga na /teacher/kalendar, u suprotnom na standardni /kalendar
  const calendarPath = 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher/kalendar' : '/kalendar';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <h2 className="text-xl font-black text-blue-600 tracking-tighter">EVENT.FON</h2>
      <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
        
        <Link href={homePath} className="hover:text-blue-600 transition-colors">
          Početna
        </Link>
        
        {/* IZMENJENO: href sada koristi calendarPath varijablu */}
        <Link href={calendarPath} className="hover:text-blue-600 transition-colors">
          Kalendar
        </Link>
        
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
          <span className="font-bold text-slate-800">👤 {userName || "Učitavanje..."}</span>
        </div>
        
        <CustomButton 
          label="Odjavi se" 
          variant="danger" 
          onClick={() => {
            // Ovde možeš pozvati i logoutAkciju iz tvojih server akcija
            window.location.href = "/login";
          }} 
        />
      </div>
    </nav>
  );
};

export default Navbar;