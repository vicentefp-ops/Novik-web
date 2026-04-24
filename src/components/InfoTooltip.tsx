import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({ text, className = '', iconClassName = 'w-4 h-4 text-slate-400' }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`relative inline-flex items-center ${className}`} 
      ref={tooltipRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="focus:outline-none rounded-full hover:bg-slate-100 p-0.5 transition-colors"
        aria-label="More information"
      >
        <Info className={iconClassName} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-64 p-3 mt-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg shadow-xl top-full left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:-top-2 before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-slate-200 after:content-[''] after:absolute after:-top-[7px] after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-b-white">
          {text}
        </div>
      )}
    </div>
  );
}
