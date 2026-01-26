"use client";
import React from 'react';
import Link from 'next/link';
import CustomButton from './CustomButton';
interface NavbarProps {
  userName: string;
}


const Navbar = ({ userName }: NavbarProps)  => {
  return (
    <nav className="flex justify-between items-center px-10 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <h2 className="text-xl font-black text-blue-600 tracking-tighter">EVENT.FON</h2>
      <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link href="/home" className="hover:text-blue-600 transition-colors">Početna</Link>
        <Link href="/kalendar" className="hover:text-blue-600 transition-colors">Kalendar</Link>
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full">
          <span>👤 {userName}</span>
        </div>
        <CustomButton label="Odjavi se" variant="danger" onClick={() => window.location.href="/"} />
      </div>
    </nav>
  );
};
export default Navbar;