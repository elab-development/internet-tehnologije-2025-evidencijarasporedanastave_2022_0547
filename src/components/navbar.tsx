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

  // DODAJEMO VIŠE OPCIJA: Proveravamo i 'admin' i 'administrator'
  const homePath = 
    (role === 'student') ? '/student' : 
    (role === 'admin' || role === 'administrator') ? '/admin' : 
    (role === 'teacher' || role === 'nastavnik') ? '/teacher' : '/';

  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <h2 className="text-xl font-black text-blue-600 tracking-tighter">EVENT.FON</h2>
      <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
        
        {/* Početna sada vodi na ispravnu rutu na osnovu gornje logike */}
        <Link href={homePath} className="hover:text-blue-600 transition-colors">
          Početna
        </Link>
        
        <Link href="/kalendar" className="hover:text-blue-600 transition-colors">
          Kalendar
        </Link>
        
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
          <span className="font-bold text-slate-800">👤 {userName || "Učitavanje..."}</span>
        </div>
        
        <CustomButton 
          label="Odjavi se" 
          variant="danger" 
          onClick={() => {
            window.location.href = "/login";
          }} 
        />
      </div>
    </nav>
  );
};

export default Navbar;