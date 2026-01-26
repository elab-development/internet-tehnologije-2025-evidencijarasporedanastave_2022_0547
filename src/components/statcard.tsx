"use client";
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatCard = ({ title, value, description }: StatCardProps) => {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all w-64 text-center">
      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest">{title}</h4>
      <h2 className="text-4xl font-black text-blue-600 my-2">{value}</h2>
      <p className="text-slate-400 text-xs">{description}</p>
    </div>
  );
};
export default StatCard;