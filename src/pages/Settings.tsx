import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Globe, Hash, Mic, Building2, MapPin, LayoutGrid, Mail, Stethoscope, Users as UsersIcon, Activity } from 'lucide-react';
import { COUNTRIES } from '../constants/locations';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { CountrySelector } from '../components/CountrySelector';
import { motion, Variants } from 'motion/react';

export function Settings() {
  const { t, i18n } = useTranslation();
  const { user, settings, setSettings } = useStore();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'es' | 'en';
    setSettings({ language: lang });
    i18n.changeLanguage(lang);
    saveSettings({ language: lang });
  };

  const handleNumberingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const numbering = e.target.value as 'FDI' | 'ADA';
    setSettings({ numberingSystem: numbering });
    saveSettings({ numberingSystem: numbering });
  };

  const saveSettings = async (newSettings: any) => {
    if (!user || !db) return;
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await setDoc(settingsRef, newSettings, { merge: true });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleClinicChange = (field: string, value: any) => {
    const updatedClinic = { ...settings.clinicInfo, [field]: value };
    if (field === 'country') {
      updatedClinic.region = '';
    }
    setSettings({ clinicInfo: updatedClinic as any });
    saveSettings({ clinicInfo: updatedClinic });
  };

  const selectedCountry = COUNTRIES.find(c => c.name === settings.clinicInfo?.country);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto pb-12"
    >
      <motion.div variants={itemVariants} className="flex items-center space-x-3">
        <SettingsIcon className="w-8 h-8 text-teal-600" />
        <h1 className="text-2xl font-bold text-slate-900">{t('settings')}</h1>
      </motion.div>

      {/* App Settings */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-teal-600" />
            {t('app_settings')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Name Setting */}
            <div className="space-y-2">
              <label htmlFor="doctorName" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <UsersIcon className="w-3 h-3" /> {t('doctor_name')}
              </label>
              <input
                id="doctorName"
                type="text"
                value={settings.doctorName || ''}
                onChange={(e) => {
                  setSettings({ doctorName: e.target.value });
                  saveSettings({ doctorName: e.target.value });
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                placeholder={t('doctor_name_placeholder')}
              />
            </div>

            {/* Language Setting */}
            <div className="space-y-2">
              <label htmlFor="language" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-3 h-3" /> {t('language')}
              </label>
              <select
                id="language"
                value={settings.language}
                onChange={handleLanguageChange}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
              >
                <option value="es">{t('spanish')}</option>
                <option value="en">{t('english')}</option>
              </select>
            </div>

            {/* Numbering System Setting */}
            <div className="space-y-2">
              <label htmlFor="numbering" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-3 h-3" /> {t('numbering_system')}
              </label>
              <select
                id="numbering"
                value={settings.numberingSystem}
                onChange={handleNumberingChange}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
              >
                <option value="FDI">FDI (11, 12...)</option>
                <option value="ADA">ADA (1, 2...)</option>
              </select>
            </div>

            {/* Health Score Setting */}
            <div className="space-y-2">
              <label htmlFor="showHealthScore" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3 h-3" /> {t('show_health_score_label')}
              </label>
              <div className="flex items-center mt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="showHealthScore"
                    className="sr-only peer"
                    checked={settings.showHealthScore !== false}
                    onChange={(e) => {
                      setSettings({ showHealthScore: e.target.checked });
                      saveSettings({ showHealthScore: e.target.checked });
                    }}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    {settings.showHealthScore !== false ? t('enabled') : t('disabled')}
                  </span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('show_health_score_desc')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Clinic Information */}
      <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100">
        <div className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            {t('clinic_onboarding_title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {t('country')} <span className="text-red-500">*</span>
              </label>
              <CountrySelector
                value={settings.clinicInfo?.country || ''}
                onChange={(val) => {
                  if (val) {
                    handleClinicChange('country', val);
                  } else {
                    // Prevent clearing the country
                    alert(t('please_select_country')); 
                  }
                }}
              />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3 h-3" /> {t('region')}
              </label>
              <select
                disabled={!settings.clinicInfo?.country}
                value={settings.clinicInfo?.region || ''}
                onChange={(e) => handleClinicChange('region', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm disabled:opacity-50"
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
                value={settings.clinicInfo?.type || 'independent'}
                onChange={(e) => handleClinicChange('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
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
                value={settings.clinicInfo?.email || ''}
                onChange={(e) => handleClinicChange('email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
              />
            </div>

            {/* Chairs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope className="w-3 h-3" /> {t('num_chairs')}
              </label>
              <select
                value={settings.clinicInfo?.chairs || '1-2'}
                onChange={(e) => handleClinicChange('chairs', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
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
                <UsersIcon className="w-3 h-3" /> {t('num_professionals')}
              </label>
              <select
                value={settings.clinicInfo?.professionals || '1'}
                onChange={(e) => handleClinicChange('professionals', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all text-sm"
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
                  onClick={() => handleClinicChange('protocol', opt)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-medium transition-all ${
                    settings.clinicInfo?.protocol === opt
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t(opt)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      {/* Admin Link */}
      <motion.div variants={itemVariants} className="text-center">
        <Link to="/admin" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          Admin
        </Link>
      </motion.div>
    </motion.div>
  );
}
