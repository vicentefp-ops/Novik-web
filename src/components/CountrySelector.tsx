import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Check } from 'lucide-react';
import { COUNTRIES, Country } from '../constants/locations';

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function CountrySelector({ value, onChange, error }: CountrySelectorProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language as 'es' | 'en';

  const sortedCountries = useMemo(() => {
    return [...COUNTRIES].sort((a, b) => {
      const nameA = currentLang === 'en' ? a.nameEn : a.name;
      const nameB = currentLang === 'en' ? b.nameEn : b.name;
      return nameA.localeCompare(nameB, currentLang);
    });
  }, [currentLang]);

  const filteredCountries = useMemo(() => {
    if (!search) return sortedCountries;
    const searchLower = search.toLowerCase();
    return sortedCountries.filter(c => {
      const name = currentLang === 'en' ? c.nameEn : c.name;
      return name.toLowerCase().includes(searchLower) || c.id.toLowerCase().includes(searchLower);
    });
  }, [sortedCountries, search, currentLang]);

  const selectedCountry = useMemo(() => {
    return COUNTRIES.find(c => c.name === value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
          error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
        } focus:ring-2 focus:ring-teal-600 text-left`}
      >
        <span className={selectedCountry ? 'text-slate-900' : 'text-slate-400'}>
          {selectedCountry 
            ? `${selectedCountry.flag} ${currentLang === 'en' ? selectedCountry.nameEn : selectedCountry.name}`
            : t('select_country')
          }
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          <div className="p-3 border-bottom border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder={t('search_country')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto py-2">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => {
                    onChange(country.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    value === country.name ? 'bg-slate-50 text-teal-600 font-medium' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">{country.flag}</span>
                    <span>{currentLang === 'en' ? country.nameEn : country.name}</span>
                  </span>
                  {value === country.name && <Check className="w-4 h-4" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                {t('no_countries_found')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
