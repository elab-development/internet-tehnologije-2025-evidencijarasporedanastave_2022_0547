"use client";
import React from 'react';

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'success';
}

const CustomButton = ({ label, onClick, variant = 'primary' }: ButtonProps) => {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    danger: "bg-red-500 hover:bg-red-600 shadow-red-200",
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
  };

  return (
    <button 
      onClick={onClick}
      className={`${styles[variant]} text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-95 cursor-pointer`}
    >
      {label}
    </button>
  );
};
export default CustomButton;