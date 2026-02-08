"use client";
import React, { useState } from "react";
import CustomButton from "./CustomButton";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
}

const StatCard = ({ title, value, description }: StatCardProps) => {
  const [present, setPresent] = useState(false);

  const handleAttendance = () => {
    console.log("KLIK RADI");
    setPresent(true);
  };

  return (
    <div
      className={`bg-white border p-6 rounded-2xl shadow-sm transition-all w-64 text-center
        ${present ? "border-emerald-400 bg-emerald-50" : "border-slate-200"}
      `}
    >
      <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest">
        {title}
      </h4>

      <h2
        className={`text-4xl font-black my-2 ${
          present ? "text-emerald-600" : "text-blue-600"
        }`}
      >
        {value}
      </h2>

      <p className="text-slate-400 text-xs mb-4">{description}</p>

      <CustomButton
        label={present ? "Prisustvo evidentirano" : "Evidentiraj prisustvo"}
        onClick={handleAttendance}
        variant={present ? "success" : "primary"}
      />
    </div>
  );
};

export default StatCard;