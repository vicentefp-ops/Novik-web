import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/logo_texto.png" 
        alt="PerioVox Logo" 
        className="w-full h-full object-contain"
      />
    </div>
  );
}
