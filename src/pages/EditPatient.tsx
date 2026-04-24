import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Save, User, Activity, Heart, ShieldCheck, Info } from 'lucide-react';
import { COUNTRIES } from '../constants/locations';
import { Patient } from '../types';
import { CountrySelector } from '../components/CountrySelector';
import { motion, Variants } from 'motion/react';

import { fetchWithRetry } from '../lib/firestore-utils';

export function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, patients, setPatients } = useStore();
  
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id || !db) return;
      try {
        const docRef = doc(db, 'patients', id);
        const docSnap = await fetchWithRetry(() => getDoc(docRef));
        if (docSnap.exists()) {
          setFormData(docSnap.data() as Patient);
        } else {
          navigate('/patients');
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, db, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !db || !user) return;

    setIsSaving(true);
    try {
      const docRef = doc(db, 'patients', id);
      await updateDoc(docRef, formData);
      
      // Update local store
      const updatedPatients = patients.map(p => p.id === id ? { ...p, ...formData } : p);
      setPatients(updatedPatients);
      
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error("Error updating patient:", error);
      alert(t('error_updating_patient'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">{t('loading')}</div>;

  const selectedCountry = COUNTRIES.find(c => c.name === formData.country);

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
      className="max-w-4xl mx-auto space-y-6 pb-12"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={`/patients/${id}`} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{t('edit_patient')}</h1>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800">{t('patient_info')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('clinical_record')}</label>
              <input
                required
                type="text"
                value={formData.clinicalRecord || ''}
                onChange={(e) => setFormData({ ...formData, clinicalRecord: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('age_range')}</label>
              <select
                required
                value={formData.ageRange || ''}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="">{t('age_range')}</option>
                <option value="<18">&lt; 18</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="56-65">56-65</option>
                <option value=">65">&gt; 65</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('biological_sex')}</label>
              <select
                required
                value={formData.biologicalSex || ''}
                onChange={(e) => setFormData({ ...formData, biologicalSex: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="">{t('biological_sex')}</option>
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('education_level')}</label>
              <select
                required
                value={formData.educationLevel || ''}
                onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
              >
                <option value="">{t('education_level')}</option>
                <option value="basic">{t('basic')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="university">{t('university')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('country')}</label>
              <CountrySelector
                value={formData.country || ''}
                onChange={(val) => setFormData({ ...formData, country: val, region: '' })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('region')}</label>
              <select
                required
                disabled={!formData.country}
                value={formData.region || ''}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-50"
              >
                <option value="">{t('select_region')}</option>
                {selectedCountry?.regions.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Risk Factors */}
        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-slate-800">{t('risk_factors')}</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('smoking_status')}</label>
                <select
                  value={formData.riskFactors?.smokingStatus || 'non-smoker'}
                  onChange={(e) => setFormData({
                    ...formData,
                    riskFactors: { ...formData.riskFactors!, smokingStatus: e.target.value as any }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
                >
                  <option value="non-smoker">{t('non_smoker')}</option>
                  <option value="smoker">{t('smoker')}</option>
                  <option value="ex-smoker">{t('ex_smoker')}</option>
                </select>
              </div>
              {formData.riskFactors?.smokingStatus === 'smoker' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cigarettes_per_day')}</label>
                  <select
                    value={formData.riskFactors?.cigarettesPerDay || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      riskFactors: { ...formData.riskFactors!, cigarettesPerDay: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
                  >
                    <option value="">{t('none')}</option>
                    <option value="1-5">1-5</option>
                    <option value="5-10">5-10</option>
                    <option value="10-20">10-20</option>
                    <option value="20+">20+</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{t('diabetes')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    riskFactors: { ...formData.riskFactors!, diabetes: !formData.riskFactors?.diabetes }
                  })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.riskFactors?.diabetes ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.riskFactors?.diabetes ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {formData.riskFactors?.diabetes && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('diabetes_controlled')}</label>
                  <select
                    value={formData.riskFactors?.diabetesControlled || 'unknown'}
                    onChange={(e) => setFormData({
                      ...formData,
                      riskFactors: { ...formData.riskFactors!, diabetesControlled: e.target.value as any }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
                  >
                    <option value="yes">{t('yes')}</option>
                    <option value="no">{t('no')}</option>
                    <option value="unknown">{t('unknown')}</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{t('hypertension')}</span>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    riskFactors: { ...formData.riskFactors!, hypertension: !formData.riskFactors?.hypertension }
                  })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.riskFactors?.hypertension ? 'bg-teal-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.riskFactors?.hypertension ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              {formData.riskFactors?.hypertension && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('hypertension_controlled')}</label>
                  <select
                    value={formData.riskFactors?.hypertensionControlled || 'unknown'}
                    onChange={(e) => setFormData({
                      ...formData,
                      riskFactors: { ...formData.riskFactors!, hypertensionControlled: e.target.value as any }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 transition-all"
                  >
                    <option value="yes">{t('yes')}</option>
                    <option value="no">{t('no')}</option>
                    <option value="unknown">{t('unknown')}</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={isSaving}
          className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-6 h-6" />
              {t('save')}
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
