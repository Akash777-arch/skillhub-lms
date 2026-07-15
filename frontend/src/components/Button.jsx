import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-lg";
  
  const variants = {
    primary: "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] motion-safe:hover:scale-105",
    secondary: "bg-transparent border border-slate-700 text-slate-300 hover:bg-slate-800",
    ghost: "bg-transparent border-transparent text-text-secondary hover:text-text-primary focus-visible:underline focus-visible:bg-slate-800/50"
  };

  const disabledStyles = disabled || loading ? "opacity-50 cursor-not-allowed motion-safe:hover:scale-100 hover:shadow-none" : "";
  
  const sizes = "px-5 py-2.5 text-sm";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${sizes} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
