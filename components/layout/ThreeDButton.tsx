
import React from 'react';

interface ThreeDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export const ThreeDButton: React.FC<ThreeDButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = "", 
  ...props 
}) => {
  const variants = {
    primary: "bg-brand-lime text-brand-dark border-brand-lime/50",
    secondary: "bg-brand-purple text-white border-brand-purple/50",
    danger: "bg-red-500 text-white border-red-400/50",
    warning: "bg-brand-gold text-brand-dark border-brand-gold/50"
  };

  return (
    <button 
      className={`button-3d px-6 py-4 rounded-2xl font-bold text-lg uppercase tracking-wider border-b-4 active:border-b-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
