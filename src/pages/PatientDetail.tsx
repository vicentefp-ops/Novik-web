import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, FileText, Calendar, TrendingUp, Edit2, Trash2, QrCode, X, Activity } from 'lucide-react';
import { QuickCheckInModal } from '../components/QuickCheckInModal';
import { PatientAIAssistant } from '../components/PatientAIAssistant';
import { COUNTRIES } from '../constants/locations';
import { deleteDoc } from 'firebase/firestore';
import { calculateHealthScore } from '../utils/calculations';
import { InfoTooltip } from '../components/InfoTooltip';
import { QRCodeSVG } from 'qrcode.react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence, Variants } from 'motion/react';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, patients, setPatients, currentPatient, setCurrentPatient, periodontograms, setPeriodontograms, settings } = useStore();
  const [loading, setLoading] = useState(!patients.find(p => p.id === id));
  const [loadingPeriodontograms, setLoadingPeriodontograms] = useState(
    periodontograms.length === 0 || periodontograms[0]?.patientId !== id
  );
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState<{isOpen: boolean, perioId: string | null}>({isOpen: false, perioId: null});
  const [isSaveReportModalOpen, setIsSaveReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');

  useEffect(() => {
    if (!user || !db || !id) return;
    
    // Optimistic load: check if patient is already in the global store
    const existingPatient = patients.find(p => p.id === id);
    if (existingPatient) {
      setCurrentPatient(existingPatient);
      setLoading(false); // Show UI immediately
    }

    const fetchPatientData = async () => {
      try {
        if (!existingPatient) {
          const patientDoc = await getDoc(doc(db, 'patients', id));
          if (patientDoc.exists()) {
            setCurrentPatient({ id: patientDoc.id, ...patientDoc.data() } as any);
          } else {
            setCurrentPatient(null);
          }
          setLoading(false);
        }

        if (periodontograms.length === 0 || periodontograms[0]?.patientId !== id) {
          setLoadingPeriodontograms(true);
        }
        const q = query(collection(db, 'periodontograms'), where('patientId', '==', id));
        const querySnapshot = await getDocs(q);
        const periodontogramsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        // Sort by date descending
        periodontogramsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setPeriodontograms(periodontogramsData);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
        setLoadingPeriodontograms(false);
      }
    };

    fetchPatientData();
  }, [id, user]);

  const handleNewPeriodontogram = () => {
    if (periodontograms.length === 0) {
      // Skip modal for the first periodontogram
      handleCheckInConfirm({});
    } else {
      setIsCheckInModalOpen(true);
    }
  };

  const handleDeletePatient = async () => {
    if (!id || !db || !user) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'patients', id));
      // Also delete periodontograms
      const q = query(collection(db, 'periodontograms'), where('patientId', '==', id));
      const querySnapshot = await getDocs(q);
      for (const d of querySnapshot.docs) {
        await deleteDoc(doc(db, 'periodontograms', d.id));
      }
      
      setPatients(patients.filter(p => p.id !== id));
      navigate('/patients');
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert(t('error_deleting_patient'));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCheckInConfirm = async (checkInData: any) => {
    if (!user || !db || !id) return;
    setIsCheckInModalOpen(false);
    
    try {
      const newPeriodontogramRef = doc(collection(db, 'periodontograms'));
      const newPeriodontogram = {
        id: newPeriodontogramRef.id,
        patientId: id,
        userId: user.uid,
        date: new Date().toISOString(),
        teeth: {},
        notes: '',
        checkIn: checkInData
      };
      
      // Clean object to ensure no undefined values are passed to Firestore
      const cleanPeriodontogram = JSON.parse(JSON.stringify(newPeriodontogram));
      
      // Optimistic update
      setPeriodontograms([cleanPeriodontogram, ...periodontograms]);
      
      // Save to Firestore
      setDoc(newPeriodontogramRef, {
        patientId: cleanPeriodontogram.patientId,
        userId: cleanPeriodontogram.userId,
        date: cleanPeriodontogram.date,
        teeth: cleanPeriodontogram.teeth,
        notes: cleanPeriodontogram.notes,
        checkIn: cleanPeriodontogram.checkIn
      }).catch(error => {
        console.error("Error creating periodontogram:", error);
      });
      
      navigate(`/patients/${id}/periodontogram/${newPeriodontogramRef.id}`);
    } catch (error) {
      console.error("Error creating periodontogram:", error);
    }
  };

  const handleDeletePeriodontogram = async (perioId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the link
    e.stopPropagation();
    
    if (!db || !user) return;
    
    if (window.confirm(t('confirm_delete_periodontogram'))) {
      try {
        await deleteDoc(doc(db, 'periodontograms', perioId));
        const currentPerios = useStore.getState().periodontograms;
        setPeriodontograms(currentPerios.filter(p => p.id !== perioId));
      } catch (error) {
        console.error("Error deleting periodontogram:", error);
        alert(t('error_deleting_periodontogram'));
      }
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">{t('loading')}</div>;
  if (!currentPatient) return <div className="p-6 text-center text-slate-500">{t('patient_not_found')}</div>;

  // Prepare chart data
  const chartData = [...periodontograms].reverse().map(perio => ({
    date: new Date(perio.date).toLocaleDateString(),
    score: calculateHealthScore(perio)
  }));

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : null;

  const handleSaveReport = (content: string) => {
    if (periodontograms.length === 0) return;
    setReportContent(content);
    setReportTitle(`${t('analysis')} ${periodontograms[0].savedReports ? periodontograms[0].savedReports.length + 1 : 1}`);
    setIsSaveReportModalOpen(true);
  };

  const confirmSaveReport = async () => {
    if (!reportTitle.trim() || !currentPatient) return;

    const updatedPatient = {
      ...currentPatient,
      savedReports: [
        ...(currentPatient.savedReports || []),
        { id: Date.now().toString(), date: new Date().toISOString(), title: reportTitle, content: reportContent }
      ]
    };
    
    try {
      // Update Firestore
      await setDoc(doc(db, 'patients', currentPatient.id), updatedPatient);
      
      // Update store
      setCurrentPatient(updatedPatient);
      setPatients(patients.map(p => p.id === currentPatient.id ? updatedPatient : p));
      setIsSaveReportModalOpen(false);
    } catch (error) {
      console.error("Error saving report:", error);
      alert(t('error_saving_report') || "Error saving report");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm(t('confirm_delete_report'))) return;
    if (!currentPatient) return;
    
    const updatedPatient = {
      ...currentPatient,
      savedReports: (currentPatient.savedReports || []).filter(r => r.id !== reportId)
    };
    
    try {
      // Update Firestore
      await setDoc(doc(db, 'patients', currentPatient.id), updatedPatient);
      
      // Update store
      setCurrentPatient(updatedPatient);
      setPatients(patients.map(p => p.id === currentPatient.id ? updatedPatient : p));
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(t('error_deleting_report') || "Error deleting report");
    }
  };

  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

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
    hidden: { y: 20, opacity: 0 },
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients" className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{currentPatient.clinicalRecord}</h1>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/patients/${id}/edit`)}
            className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
            title={t('edit')}
          >
            <Edit2 className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            title={t('delete')}
          >
            <Trash2 className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-slate-900">{t('patient_info')}</h3>
          <div className="flex items-center gap-3">
            {settings.showHealthScore !== false && latestScore !== null && (
              <div 
                className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                  latestScore >= 75 ? 'bg-emerald-100 text-emerald-700' :
                  latestScore >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                {t('health_score')}: {latestScore}/100*
                <InfoTooltip text={t('health_score_explanation')} iconClassName={`w-4 h-4 ${latestScore >= 75 ? 'text-emerald-600' : latestScore >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
              </div>
            )}
            <div className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-bold rounded-full uppercase tracking-wider">{t('patient_info_tag')}</div>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Demographics */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{t('demographics')}</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('age_range')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.ageRange}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('biological_sex')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.biologicalSex || 'na')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('country')}</dt>
                  <dd className="text-sm text-slate-900">
                    {currentPatient.country ? (
                      <span className="flex items-center gap-1.5">
                        {(() => {
                          const country = COUNTRIES.find(c => c.name === currentPatient.country);
                          return (
                            <>
                              <span>{country?.flag}</span>
                              {i18n.language === 'en' && country?.nameEn ? country.nameEn : currentPatient.country}
                            </>
                          );
                        })()}
                      </span>
                    ) : t('na')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('region')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.region || t('na')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('education_level')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.educationLevel || 'na')}</dd>
                </div>
              </dl>
            </div>

            {/* Risk Factors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{t('risk_factors')}</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('smoking_status')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">
                    {t(currentPatient.riskFactors?.smokingStatus || 'na')}
                    {currentPatient.riskFactors?.cigarettesPerDay && ` (${currentPatient.riskFactors.cigarettesPerDay} cig/day)`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('diabetes')}</dt>
                  <dd className="text-sm text-slate-900">
                    {currentPatient.riskFactors?.diabetes ? t('yes') : t('no')}
                    {currentPatient.riskFactors?.diabetes && currentPatient.riskFactors.diabetesControlled && ` - ${t('diabetes_controlled')}: ${t(currentPatient.riskFactors.diabetesControlled)}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('hypertension')}</dt>
                  <dd className="text-sm text-slate-900">
                    {currentPatient.riskFactors?.hypertension ? t('yes') : t('no')}
                    {currentPatient.riskFactors?.hypertension && currentPatient.riskFactors.hypertensionControlled && ` - ${t('hypertension_controlled')}: ${t(currentPatient.riskFactors.hypertensionControlled)}`}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Hygiene Habits */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{t('hygiene_habits')}</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('brush_type')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.hygieneHabits?.brushType || 'na')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('uses_floss')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.hygieneHabits?.usesFloss ? t('yes') : t('no')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('uses_irrigator')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.hygieneHabits?.usesIrrigator ? t('yes') : t('no')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('brushing_frequency')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.hygieneHabits?.brushingFrequency || t('na')} {t('times_day')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('last_professional_cleaning')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.hygieneHabits?.lastProfessionalCleaning || 'na')}</dd>
                </div>
              </dl>
            </div>

            {/* Perception */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">{t('patient_perception')}</h4>
              <dl className="space-y-3">
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('bleeding_gums')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.perception?.bleedingGums || 'na')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('notices_mobility')}</dt>
                  <dd className="text-sm text-slate-900">{currentPatient.perception?.noticesMobility ? t('yes') : t('no')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold text-slate-500 uppercase">{t('believes_has_periodontal_disease')}</dt>
                  <dd className="text-sm text-slate-900 capitalize">{t(currentPatient.perception?.believesHasPeriodontalDisease || 'na')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Score Chart */}
      {settings.showHealthScore !== false && chartData.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              {t('periodontal_health_progression')}
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value}/100`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0D9488" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#0D9488', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">{t('periodontogram')}s</h2>
        <div className="flex flex-wrap items-center gap-3">
          {settings.showHealthScore !== false && latestScore !== null && (
            <div 
              className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 ${
                latestScore >= 75 ? 'bg-emerald-100 text-emerald-700' :
                latestScore >= 50 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              {t('health_score')}: {latestScore}/100*
              <InfoTooltip text={t('health_score_explanation')} iconClassName={`w-4 h-4 ${latestScore >= 75 ? 'text-emerald-600' : latestScore >= 50 ? 'text-amber-600' : 'text-red-600'}`} />
            </div>
          )}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewPeriodontogram}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('new_periodontogram')}
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loadingPeriodontograms ? (
            <div className="p-6 text-center text-slate-500">{t('loading')}</div>
          ) : periodontograms.length === 0 ? (
            <div className="p-6 text-center text-slate-500">{t('no_periodontograms')}</div>
          ) : (
            <AnimatePresence mode="popLayout">
              {periodontograms.map((perio, idx) => (
                <motion.div
                  key={perio.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    to={`/patients/${id}/periodontogram/${perio.id}`}
                    className="block hover:bg-slate-50 transition-colors"
                  >
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-slate-900">
                            {t('periodontogram')} - {new Date(perio.date).toLocaleDateString()}
                          </p>
                          {perio.classification && (
                            <p className="text-xs text-teal-700 font-bold mt-1 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
                              {t('suggested_classification')}: {perio.classification.match(/(Estadio\s+[IV]+,\s*Grado\s+[A-C]|Stage\s+[IV]+,\s*Grade\s+[A-C])/i)?.[1] || perio.classification}
                            </p>
                          )}
                          <p className="text-sm text-slate-500 flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(perio.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setQrModalData({ isOpen: true, perioId: perio.id });
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('share_with_patient_qr')}
                        >
                          <QrCode className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/patients/${id}/periodontogram/${perio.id}`);
                          }}
                          className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDeletePeriodontogram(perio.id, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <PatientAIAssistant 
          patient={currentPatient} 
          periodontograms={periodontograms} 
          onSaveReport={handleSaveReport}
        />
      </motion.div>

      {currentPatient.savedReports && currentPatient.savedReports.length > 0 && (
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{t('saved_reports')}</h3>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {currentPatient.savedReports.map((report) => (
                <motion.div 
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <div className="flex items-center bg-white hover:bg-slate-50 transition-colors">
                    <button
                      onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                      className="flex-1 p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-slate-900">{report.title}</span>
                        <span className="text-xs text-slate-500">{new Date(report.date).toLocaleString()}</span>
                      </div>
                      <motion.span 
                        animate={{ rotate: expandedReportId === report.id ? 180 : 0 }}
                        className="text-slate-400 ml-4"
                      >
                        ▼
                      </motion.span>
                    </button>
                    <div className="pr-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('delete_report')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedReportId === report.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-slate-50 border-t border-slate-200 text-sm text-slate-700 whitespace-pre-wrap">
                          {report.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <QuickCheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        onConfirm={handleCheckInConfirm}
        patient={currentPatient}
      />

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setIsDeleteModalOpen(false)}
              ></motion.div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                        {t('delete_patient')}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          {t('confirm_delete_patient')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDeletePatient}
                    disabled={isDeleting}
                    className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-colors"
                  >
                    {isDeleting ? t('deleting') : t('delete')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    {t('cancel')}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Report Modal */}
      <AnimatePresence>
        {isSaveReportModalOpen && (
          <div className="fixed z-[70] inset-0 overflow-y-auto" aria-labelledby="save-report-modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setIsSaveReportModalOpen(false)}
              ></motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-md"
              >
                <div className="bg-white px-6 pt-6 pb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900" id="save-report-modal-title">
                      {t('action_save_report')}
                    </h3>
                    <button 
                      onClick={() => setIsSaveReportModalOpen(false)}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('enter_report_title')}
                      </label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        autoFocus
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setIsSaveReportModalOpen(false)}
                        className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        onClick={confirmSaveReport}
                        disabled={!reportTitle.trim()}
                        className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                      >
                        {t('save')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModalData.isOpen && qrModalData.perioId && (
          <div className="fixed z-[60] inset-0 overflow-y-auto" aria-labelledby="qr-modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                aria-hidden="true" 
                onClick={() => setQrModalData({isOpen: false, perioId: null})}
              ></motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-sm"
              >
                <div className="bg-white px-6 pt-6 pb-8">
                  <div className="flex flex-col items-center mb-6">
                    <img 
                      src="/logo_texto.png" 
                      alt="PerioVox" 
                      className="h-12 w-auto object-contain mb-4" 
                    />
                    <div className="flex justify-between items-center w-full">
                      <h3 className="text-xl font-bold text-slate-900" id="qr-modal-title">
                        {t('patient_summary_title')}
                      </h3>
                      <button 
                        onClick={() => setQrModalData({isOpen: false, perioId: null})}
                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <p className="text-sm text-slate-500 text-center">
                      {t('scan_qr_desc')}
                    </p>
                    
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                      <QRCodeSVG 
                        value={`${window.location.origin.replace('ais-dev-', 'ais-pre-')}/report/${qrModalData.perioId}?lang=${i18n.language}`} 
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <p className="text-[10px] text-slate-400 text-center italic px-4">
                      {t('cookie_auth_warning')}
                    </p>
                    
                    <div className="w-full">
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin.replace('ais-dev-', 'ais-pre-')}/report/${qrModalData.perioId}?lang=${i18n.language}`;
                          navigator.clipboard.writeText(shareUrl);
                          alert(t('link_copied'));
                        }}
                        className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                      >
                        {t('copy_link')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
