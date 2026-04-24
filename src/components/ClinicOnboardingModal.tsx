import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { COUNTRIES } from '../constants/locations';
import { Building2, Mail, Users, Stethoscope, LayoutGrid, MapPin } from 'lucide-react';
import { ClinicInfo } from '../types';
import { CountrySelector } from './CountrySelector';
import { motion, AnimatePresence } from 'motion/react';

export function ClinicOnboardingModal() {
  const { t } = useTranslation();
  const { user, settings, setSettings } = useStore();
  
  const [doctorName, setDoctorName] = useState('');
  const [numberingSystem, setNumberingSystem] = useState<'FDI' | 'ADA'>(settings.numberingSystem || 'FDI');
  const [formData, setFormData] = useState<ClinicInfo>({
    country: '',
    region: '',
    type: 'independent',
    chairs: '1-2',
    professionals: '1',
    protocol: 'no',
    email: user?.email || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryError, setCountryError] = useState(false);

  // Only show if user is logged in, language is confirmed, clinicInfo is missing, and terms are accepted
  if (!user || !settings.languageConfirmed || settings.clinicInfo || settings.termsAccepted !== true) return null;

  const selectedCountry = COUNTRIES.find(c => c.name === formData.country);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;

    if (!formData.country) {
      setCountryError(true);
      return;
    }
    setCountryError(false);

    setIsSubmitting(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const newSettings = {
        clinicInfo: formData,
        doctorName: doctorName.trim() || undefined,
        numberingSystem
      };
      
      // Update local state immediately for better UX
      // This triggers the modal to close immediately
      setSettings(newSettings);

      // Save to Firestore in the background
      setDoc(userSettingsRef, newSettings, { merge: true }).catch(err => {
        console.error("Error saving clinic info in background:", err);
      });
      
    } catch (error) {
      console.error("Error in clinic onboarding submission:", error);
      alert(t('save_clinic_error'));
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {user && settings.languageConfirmed && !settings.clinicInfo && settings.termsAccepted === true && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{t('clinic_onboarding_title')}</h2>
                  <p className="text-slate-500 text-sm">{t('clinic_onboarding_desc')}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    {t('doctor_name')}
                  </label>
                  <input
                    type="text"
                    required
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all"
                    placeholder={t('doctor_name_placeholder')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    {t('numbering_system')}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="numberingSystem"
                        value="FDI"
                        checked={numberingSystem === 'FDI'}
                        onChange={() => setNumberingSystem('FDI')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-600 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">FDI (11-48)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="numberingSystem"
                        value="ADA"
                        checked={numberingSystem === 'ADA'}
                        onChange={() => setNumberingSystem('ADA')}
                        className="w-4 h-4 text-teal-600 focus:ring-teal-600 border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">ADA/Universal (1-32)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {t('country')}
                    </label>
                    <CountrySelector
                      value={formData.country}
                      onChange={(val) => {
                        setFormData({ ...formData, country: val, region: '' });
                        setCountryError(false);
                      }}
                      error={countryError}
                    />
                    {countryError && (
                      <p className="text-xs text-red-500 mt-1">{t('select_country')}</p>
                    )}
                  </div>

                  {/* Region */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {t('region')}
                    </label>
                    <select
                      required
                      disabled={!formData.country}
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all disabled:opacity-50"
                    >
                      <option value="">{t('select_region')}</option>
                      {selectedCountry?.regions.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Clinic Type */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <LayoutGrid className="w-3 h-3" /> {t('clinic_type')}
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all"
                    >
                      <option value="independent">{t('independent')}</option>
                      <option value="franchise">{t('franchise')}</option>
                      <option value="hospital">{t('hospital')}</option>
                      <option value="university">{t('university')}</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {t('clinic_email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all"
                      placeholder="clinic@example.com"
                    />
                  </div>

                  {/* Chairs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-3 h-3" /> {t('num_chairs')}
                    </label>
                    <select
                      value={formData.chairs}
                      onChange={(e) => setFormData({ ...formData, chairs: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all"
                    >
                      <option value="1-2">1–2</option>
                      <option value="3-5">3–5</option>
                      <option value="6-10">6–10</option>
                      <option value="10+">10+</option>
                    </select>
                  </div>

                  {/* Professionals */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-3 h-3" /> {t('num_professionals')}
                    </label>
                    <select
                      value={formData.professionals}
                      onChange={(e) => setFormData({ ...formData, professionals: e.target.value as any })}
                      className="w-full px-4 py-3 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-600 transition-all"
                    >
                      <option value="1">1</option>
                      <option value="2-3">2–3</option>
                      <option value="4-6">4–6</option>
                      <option value="6+">6+</option>
                    </select>
                  </div>
                </div>

                {/* Protocol */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <LayoutGrid className="w-3 h-3" /> {t('periodontal_protocol')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['yes', 'no', 'partial'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData({ ...formData, protocol: opt as any })}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                          formData.protocol === opt
                            ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t(opt)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-600/10 disabled:opacity-50"
                >
                  {isSubmitting ? t('saving') : t('save')}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
