import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { Users, Plus, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { COUNTRIES } from '../constants/locations';
import { fetchWithRetry } from '../lib/firestore-utils';
import { CountrySelector } from '../components/CountrySelector';
import { motion, AnimatePresence, Variants } from 'motion/react';

export function Patients() {
  const { t } = useTranslation();
  const { user, patients, setPatients } = useStore();
  const [loading, setLoading] = useState(patients.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New patient form
  const [clinicalRecord, setClinicalRecord] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [email, setEmail] = useState('');
  
  // Big Data Fields
  const [biologicalSex, setBiologicalSex] = useState<'male' | 'female' | 'other'>('male');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [educationLevel, setEducationLevel] = useState<'basic' | 'medium' | 'university'>('basic');
  
  const [smokingStatus, setSmokingStatus] = useState<'non-smoker' | 'smoker' | 'ex-smoker'>('non-smoker');
  const [cigarettesPerDay, setCigarettesPerDay] = useState('');
  const [diabetes, setDiabetes] = useState(false);
  const [diabetesControlled, setDiabetesControlled] = useState<'yes' | 'no' | 'unknown'>('unknown');
  const [hypertension, setHypertension] = useState(false);
  const [hypertensionControlled, setHypertensionControlled] = useState<'yes' | 'no' | 'unknown'>('unknown');
  
  const [brushType, setBrushType] = useState<'manual' | 'electric'>('manual');
  const [usesFloss, setUsesFloss] = useState(false);
  const [usesIrrigator, setUsesIrrigator] = useState(false);
  const [brushingFrequency, setBrushingFrequency] = useState<'1' | '2' | '3+'>('2');
  const [lastProfessionalCleaning, setLastProfessionalCleaning] = useState<'0-3-months' | '3-6-months' | '6-12-months' | '12-18-months' | '18+-months'>('6-12-months');
  
  const [bleedingGums, setBleedingGums] = useState<'never' | 'sometimes' | 'frequently'>('sometimes');
  const [noticesMobility, setNoticesMobility] = useState(false);
  const [believesHasPeriodontalDisease, setBelievesHasPeriodontalDisease] = useState<'yes' | 'no' | 'unknown'>('unknown');

  const fetchPatients = async () => {
    if (!user || !db) return;
    if (patients.length === 0) setLoading(true);
    try {
      const q = query(collection(db, 'patients'), where('userId', '==', user.uid));
      const querySnapshot = await fetchWithRetry(() => getDocs(q));
      const patientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      setPatients(patientsData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    
    if (!clinicalRecord.trim()) {
      setSaveError(t('please_enter_clinical_record'));
      return;
    }
    if (!ageRange) {
      setSaveError(t('please_select_age_range'));
      return;
    }

    if (!user) {
      setSaveError(t('not_logged_in_error'));
      return;
    }
    if (!db) {
      setSaveError(t('db_connection_error'));
      return;
    }
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const newDocRef = doc(collection(db, 'patients'));

      const riskFactors: any = {
        smokingStatus,
        diabetes,
        hypertension,
      };
      if (smokingStatus === 'smoker' && cigarettesPerDay) riskFactors.cigarettesPerDay = cigarettesPerDay;
      if (diabetes) riskFactors.diabetesControlled = diabetesControlled;
      if (hypertension) riskFactors.hypertensionControlled = hypertensionControlled;

      const newPatient = {
        id: newDocRef.id,
        userId: user.uid,
        clinicalRecord,
        ageRange,
        email,
        biologicalSex,
        country,
        region,
        educationLevel,
        riskFactors,
        hygieneHabits: {
          brushType,
          usesFloss,
          usesIrrigator,
          brushingFrequency,
          lastProfessionalCleaning
        },
        perception: {
          bleedingGums,
          noticesMobility,
          believesHasPeriodontalDisease
        },
        createdAt: new Date().toISOString()
      };
      
      // Clean object to ensure no undefined values are passed to Firestore
      const cleanPatient = JSON.parse(JSON.stringify(newPatient));
      
      // Optimistic update
      setPatients([cleanPatient, ...patients]);
      
      // Fire and forget the save to prevent UI hanging
      setDoc(newDocRef, cleanPatient).catch(err => {
        console.error("Failed to save patient to backend:", err);
      });
      
      setIsModalOpen(false);
      resetForm();
      
    } catch (error: any) {
      console.error("Error in handleAddPatient:", error);
      setSaveError(t('save_patient_error'));
      fetchPatients(); // Revert optimistic update if needed
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setClinicalRecord('');
    setAgeRange('');
    setEmail('');
    setBiologicalSex('male');
    setCountry('');
    setRegion('');
    setEducationLevel('basic');
    setSmokingStatus('non-smoker');
    setCigarettesPerDay('');
    setDiabetes(false);
    setDiabetesControlled('unknown');
    setHypertension(false);
    setHypertensionControlled('unknown');
    setBrushType('manual');
    setUsesFloss(false);
    setUsesIrrigator(false);
    setBrushingFrequency('2');
    setLastProfessionalCleaning('6-12-months');
    setBleedingGums('sometimes');
    setNoticesMobility(false);
    setBelievesHasPeriodontalDisease('unknown');
  };

  const filteredPatients = patients.filter(p => 
    p.clinicalRecord?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
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
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.h1 variants={itemVariants} className="text-2xl font-bold text-slate-900">{t('patients')}</motion.h1>
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('new_patient')}
        </motion.button>
      </div>

      <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative rounded-xl shadow-sm max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="focus:ring-teal-600 focus:border-teal-600 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-2 border transition-all"
              placeholder={t('search_patients')}
            />
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-500">{t('loading')}</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-6 text-center text-slate-500">{t('no_patients')}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPatients.map((patient, idx) => (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link 
                    to={`/patients/${patient.id}`}
                    className="block hover:bg-slate-50 transition-colors"
                  >
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                          {patient.clinicalRecord?.charAt(0) || '#'}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-slate-900">{patient.clinicalRecord}</p>
                          <p className="text-sm text-slate-500">{patient.email || t('no_email')}</p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">
                        {t('age_range_short')} {patient.ageRange}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Add Patient Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 transition-opacity" 
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
              </motion.div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-8 rounded-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">{t('new_patient')}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddPatient} className="space-y-8">
                    {saveError && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                      >
                        {saveError}
                      </motion.div>
                    )}
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 border-b border-teal-600/20 pb-2">{t('patient_info')}</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('clinical_record')} *</label>
                        <input
                          type="text"
                          value={clinicalRecord}
                          onChange={(e) => setClinicalRecord(e.target.value)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('age_range')} *</label>
                        <select
                          value={ageRange}
                          onChange={(e) => setAgeRange(e.target.value)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="">{t('age_range')}</option>
                          {["15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80-84", "85+"].map(range => (
                            <option key={range} value={range}>{range}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('biological_sex')}</label>
                        <select
                          value={biologicalSex}
                          onChange={(e) => setBiologicalSex(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="male">{t('male')}</option>
                          <option value="female">{t('female')}</option>
                          <option value="other">{t('other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('email')}</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('country')}</label>
                        <CountrySelector
                          value={country}
                          onChange={(val) => {
                            setCountry(val);
                            setRegion(''); // Reset region when country changes
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('region')}</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          disabled={!country}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                        >
                          <option value="">{t('select_region')}</option>
                          {country && COUNTRIES.find(c => c.name === country)?.regions.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('education_level')}</label>
                        <select
                          value={educationLevel}
                          onChange={(e) => setEducationLevel(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="basic">{t('basic')}</option>
                          <option value="medium">{t('medium')}</option>
                          <option value="university">{t('university')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 border-b border-teal-600/20 pb-2">{t('risk_factors')}</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('smoking_status')}</label>
                        <select
                          value={smokingStatus}
                          onChange={(e) => setSmokingStatus(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="non-smoker">{t('non_smoker')}</option>
                          <option value="smoker">{t('smoker')}</option>
                          <option value="ex-smoker">{t('ex_smoker')}</option>
                        </select>
                      </div>
                      {smokingStatus === 'smoker' && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t('cigarettes_per_day')}</label>
                          <select
                            value={cigarettesPerDay}
                            onChange={(e) => setCigarettesPerDay(e.target.value)}
                            className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                          >
                            <option value="">-</option>
                            <option value="1-5">1-5</option>
                            <option value="5-10">5-10</option>
                            <option value="10-20">10-20</option>
                            <option value="20+">20+</option>
                          </select>
                        </motion.div>
                      )}
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="diabetes"
                          checked={diabetes}
                          onChange={(e) => setDiabetes(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-slate-300 rounded transition-all"
                        />
                        <label htmlFor="diabetes" className="ml-2 block text-sm text-slate-700">{t('diabetes')}</label>
                      </div>
                      {diabetes && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t('diabetes_controlled')}</label>
                          <select
                            value={diabetesControlled}
                            onChange={(e) => setDiabetesControlled(e.target.value as any)}
                            className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                          >
                            <option value="yes">{t('yes')}</option>
                            <option value="no">{t('no')}</option>
                            <option value="unknown">{t('unknown')}</option>
                          </select>
                        </motion.div>
                      )}
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="hypertension"
                          checked={hypertension}
                          onChange={(e) => setHypertension(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-slate-300 rounded transition-all"
                        />
                        <label htmlFor="hypertension" className="ml-2 block text-sm text-slate-700">{t('hypertension')}</label>
                      </div>
                      {hypertension && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <label className="block text-sm font-medium text-slate-700 mb-1">{t('hypertension_controlled')}</label>
                          <select
                            value={hypertensionControlled}
                            onChange={(e) => setHypertensionControlled(e.target.value as any)}
                            className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                          >
                            <option value="yes">{t('yes')}</option>
                            <option value="no">{t('no')}</option>
                            <option value="unknown">{t('unknown')}</option>
                          </select>
                        </motion.div>
                      )}
                    </div>

                    {/* Hygiene Habits */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 border-b border-teal-600/20 pb-2">{t('hygiene_habits')}</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('brush_type')}</label>
                        <select
                          value={brushType}
                          onChange={(e) => setBrushType(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="manual">{t('manual')}</option>
                          <option value="electric">{t('electric')}</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="usesFloss"
                          checked={usesFloss}
                          onChange={(e) => setUsesFloss(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-slate-300 rounded transition-all"
                        />
                        <label htmlFor="usesFloss" className="ml-2 block text-sm text-slate-700">{t('uses_floss')}</label>
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="usesIrrigator"
                          checked={usesIrrigator}
                          onChange={(e) => setUsesIrrigator(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-slate-300 rounded transition-all"
                        />
                        <label htmlFor="usesIrrigator" className="ml-2 block text-sm text-slate-700">{t('uses_irrigator')}</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('brushing_frequency')}</label>
                        <select
                          value={brushingFrequency}
                          onChange={(e) => setBrushingFrequency(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3+">3+</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('last_professional_cleaning')}</label>
                        <select
                          value={lastProfessionalCleaning}
                          onChange={(e) => setLastProfessionalCleaning(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="0-3-months">0-3 {t('months')}</option>
                          <option value="3-6-months">3-6 {t('months')}</option>
                          <option value="6-12-months">6-12 {t('months')}</option>
                          <option value="12-18-months">12-18 {t('months')}</option>
                          <option value="18+-months">18+ {t('months')}</option>
                        </select>
                      </div>
                    </div>

                    {/* Perception */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-3">
                        <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-4 border-b border-teal-600/20 pb-2">{t('patient_perception')}</h4>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('bleeding_gums')}</label>
                        <select
                          value={bleedingGums}
                          onChange={(e) => setBleedingGums(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="never">{t('never')}</option>
                          <option value="sometimes">{t('sometimes')}</option>
                          <option value="frequently">{t('frequently')}</option>
                        </select>
                      </div>
                      <div className="flex items-center pt-6">
                        <input
                          type="checkbox"
                          id="noticesMobility"
                          checked={noticesMobility}
                          onChange={(e) => setNoticesMobility(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-600 border-slate-300 rounded transition-all"
                        />
                        <label htmlFor="noticesMobility" className="ml-2 block text-sm text-slate-700">{t('notices_mobility')}</label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{t('believes_has_periodontal_disease')}</label>
                        <select
                          value={believesHasPeriodontalDisease}
                          onChange={(e) => setBelievesHasPeriodontalDisease(e.target.value as any)}
                          className="focus:ring-teal-600 focus:border-teal-600 block w-full sm:text-sm border-slate-300 rounded-xl py-2 px-3 border transition-all"
                        >
                          <option value="yes">{t('yes')}</option>
                          <option value="no">{t('no')}</option>
                          <option value="unknown">{t('unknown')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => setIsModalOpen(false)}
                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-6 py-2.5 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-8 py-2.5 bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? t('saving') : t('save')}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
