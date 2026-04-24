import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Activity, ShieldAlert, Droplets, Ruler, Sparkles, TrendingUp, Info } from 'lucide-react';
import { calculateHealthScore } from '../utils/calculations';
import { Periodontogram } from '../types';
import { useTranslation } from 'react-i18next';
import { InfoTooltip } from '../components/InfoTooltip';
import i18n from '../i18n';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, Variants } from 'motion/react';

export function PatientSummary() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodontogram, setPeriodontogram] = useState<Periodontogram | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [score, setScore] = useState<number>(0);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const langParam = searchParams.get('lang');
    
    if (langParam && ['es', 'en'].includes(langParam)) {
      i18n.changeLanguage(langParam);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (['es', 'en'].includes(browserLang)) {
        i18n.changeLanguage(browserLang);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'periodontograms', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Periodontogram;
          setPeriodontogram(data);
          setScore(calculateHealthScore(data));

          // Fetch patient data
          if (data.patientId) {
            const patientRef = doc(db, 'patients', data.patientId);
            const patientSnap = await getDoc(patientRef);
            if (patientSnap.exists()) {
              setPatient(patientSnap.data());
            }

            // Fetch all periodontograms for this patient to show evolution
            const q = query(collection(db, 'periodontograms'), where('patientId', '==', data.patientId));
            const querySnapshot = await getDocs(q);
            const allPerios = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Periodontogram[];

            // Sort by date ascending for the chart
            allPerios.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const chartData = allPerios.map(p => ({
              date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
              score: calculateHealthScore(p),
              fullDate: new Date(p.date).toLocaleDateString()
            }));

            setEvolutionData(chartData);
          }
        } else {
          setError(t('analysis_not_found'));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t('error_loading_data'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !periodontogram) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('invalid_link')}</h2>
          <p className="text-slate-500">{error || t('analysis_not_exists')}</p>
        </div>
      </div>
    );
  }

  // Calculate specific metrics for simple explanation
  let totalSites = 0;
  let bleedingSites = 0;
  let plaqueSites = 0;
  let pocketsOver4 = 0;
  let calOver4 = 0;
  let mobilityCount = 0;
  let furcationCount = 0;

  Object.values(periodontogram.teeth).forEach(tooth => {
    if (tooth.missing || tooth.implant) return;
    
    if (tooth.mobility && tooth.mobility > 0) mobilityCount++;
    if (tooth.furcation) {
      Object.values(tooth.furcation).forEach(val => {
        if (val && val > 0) furcationCount++;
      });
    }

    ['buccal', 'lingual'].forEach(surface => {
      const depths = tooth.probingDepth?.[surface as 'buccal' | 'lingual'] || [null, null, null];
      const margins = tooth.gingivalMargin?.[surface as 'buccal' | 'lingual'] || [null, null, null];
      const bleeding = tooth.bleeding?.[surface as 'buccal' | 'lingual'] || [false, false, false];
      const plaque = tooth.plaque?.[surface as 'buccal' | 'lingual'] || [false, false, false];

      for (let i = 0; i < 3; i++) {
        totalSites++;
        if (depths[i] !== null && depths[i]! >= 4) pocketsOver4++;
        if (bleeding[i]) bleedingSites++;
        if (plaque[i]) plaqueSites++;
        
        const cal = (depths[i] || 0) + (margins[i] || 0);
        if (cal >= 4) calOver4++;
      }
    });
  });

  const bopPercentage = totalSites > 0 ? Math.round((bleedingSites / totalSites) * 100) : 0;
  const plaquePercentage = totalSites > 0 ? Math.round((plaqueSites / totalSites) * 100) : 0;
  const pocketsPercentage = totalSites > 0 ? Math.round((pocketsOver4 / totalSites) * 100) : 0;
  const calPercentage = totalSites > 0 ? Math.round((calOver4 / totalSites) * 100) : 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-50 border-emerald-100';
    if (s >= 50) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  const getMessage = (s: number) => {
    if (s >= 80) return t('excellent_health');
    if (s >= 50) return t('moderate_inflammation');
    return t('severe_inflammation');
  };

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
      className="min-h-screen bg-slate-50 py-8 px-4 font-sans"
    >
      <div className="max-w-md mx-auto">
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <img 
            src="/logo_texto.png" 
            alt="PerioVoxAI" 
            className="h-10 w-auto object-contain" 
          />
          {patient && (
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{t('patient')}</p>
              <p className="text-sm font-bold text-slate-900">{patient.name}</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className={`rounded-3xl p-8 text-center border mb-6 shadow-sm ${getScoreBg(score)}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-slate-600 font-medium uppercase tracking-wider text-sm">{t('health_score_index')}</h1>
            <InfoTooltip text={t('health_score_explanation')} iconClassName="w-4 h-4 text-slate-400" />
          </div>
          <div className={`text-7xl font-black tracking-tighter mb-4 ${getScoreColor(score)}`}>
            {score}<span className="text-3xl text-slate-400 font-medium">/100</span>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed">
            {getMessage(score)}
          </p>
        </motion.div>

        {evolutionData.length > 1 && (
          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              {t('periodontal_health_progression')}
            </h2>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    fontSize={10} 
                    tick={{ fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0d9488" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{t('analysis_details')}</h2>
          
          <div className="space-y-6">
            {/* 1. Inflammation (BOP) */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {t('inflammation_bleeding')}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{bopPercentage}%</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {bopPercentage > 10 ? t('bleeding_detected') : t('no_bleeding')}
                </p>
              </div>
            </div>

            {/* 2. Hygiene (Plaque) */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {t('hygiene_plaque')}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{plaquePercentage}%</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {plaquePercentage > 20 ? t('plaque_detected') : t('good_hygiene')}
                </p>
              </div>
            </div>

            {/* 3. Pockets (PPD) */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {t('deep_pockets')}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{pocketsPercentage}%</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {pocketsPercentage > 0 ? t('pockets_detected') : t('no_pockets')}
                </p>
              </div>
            </div>

            {/* 4. Support (CAL) */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
                <Ruler className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {t('support_integrity')}
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{calPercentage}%</span>
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {calPercentage > 10 ? t('support_loss_detected') : t('good_support')}
                </p>
              </div>
            </div>

            {/* 5. Risk (Mobility/Furcas) */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {t('risk_loss')}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {(mobilityCount > 0 || furcationCount > 0) ? t('high_risk_loss') : t('low_risk_loss')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {patient?.riskFactors && (
          <motion.div variants={itemVariants} className="bg-slate-900 rounded-3xl p-6 mb-6 text-white shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              {t('risk_factors')}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-white/50 mb-1 uppercase font-bold tracking-widest">{t('smoking_status')}</p>
                <p className="font-medium">{t(patient.riskFactors.smokingStatus || 'non_smoker')}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl">
                <p className="text-white/50 mb-1 uppercase font-bold tracking-widest">{t('diabetes')}</p>
                <p className="font-medium">{patient.riskFactors.diabetes ? t('yes') : t('no')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {patient?.perception && (
          <motion.div variants={itemVariants} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{t('patient_perception')}</h2>
            <div className="space-y-4">
              {patient.perception.bleedingGums && patient.perception.bleedingGums !== 'never' && (
                <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs text-red-600 font-bold uppercase tracking-widest mb-1">{t('bleeding_gums')}</p>
                  <p className="text-sm text-slate-700">{t(patient.perception.bleedingGums)}</p>
                </div>
              )}
              {patient.perception.noticesMobility && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mb-1">{t('notices_mobility')}</p>
                  <p className="text-sm text-slate-700">{t('yes')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="text-center text-slate-400 text-xs">
          <p>{t('analysis_date')} {new Date(periodontogram.date).toLocaleDateString()}</p>
          <p className="mt-1">{t('consult_professional')}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
