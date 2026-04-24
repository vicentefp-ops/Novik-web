import React, { useState, useEffect } from 'react';
import { Download, Users, UserSquare2, Activity, ShieldAlert, ArrowLeft } from 'lucide-react';
import { downloadCSV } from '../utils/export';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AdminMetrics } from '../components/AdminMetrics';
import { useTranslation } from 'react-i18next';
import { motion, Variants } from 'motion/react';

import { normalizePeriodontogram } from '../utils/normalization';
import { calculateHealthScore } from '../utils/calculations';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const setPresetDate = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const setToday = () => setPresetDate(0);
  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const dateStr = d.toISOString().split('T')[0];
    setStartDate(dateStr);
    setEndDate(dateStr);
  };

  const isAdmin = user?.email?.toLowerCase().trim() === 'vicentefp@gmail.com';

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

  useEffect(() => {
    if (user === null) {
      navigate('/login');
    } else if (user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">{t('loading')}</div>;
  }

  if (!isAdmin) {
    return null;
  }

  const handleExport = async (type: 'users' | 'patients' | 'evolutions' | 'sites' | 'dashboards') => {
    if (!db) {
      setError(t('db_connection_error'));
      return;
    }
    
    setIsExporting(type);
    setError(null);
    
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      
      switch (type) {
        case 'users': {
          const querySnapshot = await getDocs(collection(db, 'userSettings'));
          const usersData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(data => {
              if (!data.createdAt) return false;
              const date = data.createdAt.split('T')[0];
              return date >= startDate && date <= endDate;
            })
            .map(data => {
              // Flatten clinic info for easier CSV reading
              const clinicInfo = data.clinicInfo || {};
              delete data.clinicInfo;
              
              // Prefix clinic info keys to avoid collisions and make it clear
              const flattenedClinicInfo: any = {};
              Object.keys(clinicInfo).forEach(key => {
                flattenedClinicInfo[`clinic_${key}`] = clinicInfo[key];
              });
              
              return { ...data, ...flattenedClinicInfo };
            });
          downloadCSV(usersData, `periovox_users_${dateStr}`, t('not_enough_data_to_compare'));
          break;
        }
        case 'patients': {
          const querySnapshot = await getDocs(collection(db, 'patients'));
          const patientsData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(data => {
              if (!data.createdAt) return false;
              const date = data.createdAt.split('T')[0];
              return date >= startDate && date <= endDate;
            })
            .map(data => {
              // Flatten nested objects for easier CSV reading
              const riskFactors = data.riskFactors || {};
              const hygieneHabits = data.hygieneHabits || {};
              const perception = data.perception || {};
              
              delete data.riskFactors;
              delete data.hygieneHabits;
              delete data.perception;
              
              // Prefix keys to avoid collisions and make it clear
              const flattenedHygiene: any = {};
              Object.keys(hygieneHabits).forEach(key => {
                flattenedHygiene[`hygiene_${key}`] = hygieneHabits[key];
              });
              
              const flattenedPerception: any = {};
              Object.keys(perception).forEach(key => {
                flattenedPerception[`perception_${key}`] = perception[key];
              });
              
              return { 
                ...data, 
                ...riskFactors, 
                ...flattenedHygiene, 
                ...flattenedPerception 
              };
            });
          downloadCSV(patientsData, `periovox_patients_${dateStr}`, t('not_enough_data_to_compare'));
          break;
        }
        case 'evolutions': {
          const querySnapshot = await getDocs(collection(db, 'periodontograms'));
          const periosData = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(data => {
              if (!data.date) return false;
              const date = data.date.split('T')[0];
              return date >= startDate && date <= endDate;
            })
            .map(data => {
              const flatData: any = { id: data.id, patientId: data.patientId, userId: data.userId, date: data.date, notes: data.notes };
              flatData.teethDataJSON = JSON.stringify(data.teeth || {});
              return flatData;
            });
          downloadCSV(periosData, `periovox_periodontograms_${dateStr}`, t('not_enough_data_to_compare'));
          break;
        }
        case 'sites': {
          const querySnapshot = await getDocs(collection(db, 'periodontograms'));
          const allSites: any[] = [];
          querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(data => {
              if (!data.date) return false;
              const date = data.date.split('T')[0];
              return date >= startDate && date <= endDate;
            })
            .forEach(data => {
              const sites = normalizePeriodontogram(data);
              allSites.push(...sites);
            });
          downloadCSV(allSites, `periovox_periodontal_sites_${dateStr}`, t('not_enough_data_to_compare'));
          break;
        }
        case 'dashboards': {
          // Fetch all users, patients, and periodontograms
          const usersSnap = await getDocs(collection(db, 'userSettings'));
          const patientsSnap = await getDocs(collection(db, 'patients'));
          const periosSnap = await getDocs(collection(db, 'periodontograms'));

          const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          const patients = patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          const periodontograms = periosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

          const dashboardData = users.map(user => {
            const userPatients = patients.filter(p => p.userId === user.id);
            const userPerios = periodontograms.filter(p => p.userId === user.id);

            const patientHistories = userPatients.map(patient => {
              const patientPerios = userPerios
                .filter(p => p.patientId === patient.id)
                .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

              if (patientPerios.length === 0) return null;

              const scores = patientPerios.map(p => calculateHealthScore(p));
              const firstScore = scores[0];
              const latestScore = scores[scores.length - 1];
              const maxScore = Math.max(...scores);
              
              const hasMultiple = scores.length > 1;
              const improvement = hasMultiple ? latestScore - firstScore : 0;
              
              let cohort = 'baseline';
              if (hasMultiple) {
                cohort = latestScore >= 80 ? 'maintenance' : 'treatment';
              }

              const relapsed = hasMultiple && (maxScore >= 70) && (maxScore - latestScore >= 5);

              return {
                firstScore,
                latestScore,
                improvement,
                cohort,
                relapsed,
                hasMultiple
              };
            }).filter(Boolean) as any[];

            const baselinePatients = patientHistories.filter(p => p.cohort === 'baseline');
            const avgBaselineScore = baselinePatients.length ? Math.round(baselinePatients.reduce((acc, p) => acc + p.firstScore, 0) / baselinePatients.length) : 0;

            const treatmentPatients = patientHistories.filter(p => p.cohort === 'treatment');
            const avgTreatmentImprovement = treatmentPatients.length ? Math.round(treatmentPatients.reduce((acc, p) => acc + p.improvement, 0) / treatmentPatients.length) : 0;

            const maintenancePatients = patientHistories.filter(p => p.cohort === 'maintenance');
            const avgMaintenanceScore = maintenancePatients.length ? Math.round(maintenancePatients.reduce((acc, p) => acc + p.latestScore, 0) / maintenancePatients.length) : 0;

            const trackedPatients = patientHistories.filter(p => p.hasMultiple);
            const avgGlobalImprovement = trackedPatients.length ? Math.round(trackedPatients.reduce((acc, p) => acc + p.improvement, 0) / trackedPatients.length) : 0;
            
            const improvedCount = trackedPatients.filter(p => p.improvement >= 5).length;
            const stableCount = trackedPatients.filter(p => p.improvement > -5 && p.improvement < 5).length;
            const worsenedCount = trackedPatients.filter(p => p.improvement <= -5).length;

            const improvedPercent = trackedPatients.length ? Math.round((improvedCount / trackedPatients.length) * 100) : 0;
            const stablePercent = trackedPatients.length ? Math.round((stableCount / trackedPatients.length) * 100) : 0;
            const worsenedPercent = trackedPatients.length ? Math.round((worsenedCount / trackedPatients.length) * 100) : 0;

            const relapseCount = trackedPatients.filter(p => p.relapsed).length;
            const relapsePercent = trackedPatients.length ? Math.round((relapseCount / trackedPatients.length) * 100) : 0;

            const stabilizedPercent = trackedPatients.length ? Math.round((maintenancePatients.length / trackedPatients.length) * 100) : 0;

            return {
              userId: user.id,
              doctorName: user.doctorName || '',
              clinicType: user.clinicType || '',
              totalPatients: userPatients.length,
              totalPeriodontograms: userPerios.length,
              baselinePatientsCount: baselinePatients.length,
              avgBaselineScore,
              treatmentPatientsCount: treatmentPatients.length,
              avgTreatmentImprovement,
              maintenancePatientsCount: maintenancePatients.length,
              avgMaintenanceScore,
              trackedPatientsCount: trackedPatients.length,
              avgGlobalImprovement,
              improvedPercent,
              stablePercent,
              worsenedPercent,
              relapsePercent,
              stabilizedPercent
            };
          });

          downloadCSV(dashboardData, `periovox_dashboards_${dateStr}`, t('not_enough_data_to_compare'));
          break;
        }
      }
    } catch (err: any) {
      console.error("Error exporting data:", err);
      setError(t('export_error'));
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title={t('back_to_app')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo_texto.png" alt="PerioVox" className="h-8 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">{t('advanced_data_center')}</h1>
              <p className="text-xs text-slate-500 font-medium">{t('hidden_admin_panel')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-200">
          <ShieldAlert className="w-4 h-4" />
          {t('restricted_access')}
        </div>
      </header>

      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto p-6 md:p-8"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{t('big_data_export')}</h2>
          <p className="text-slate-600 text-lg">
            {t('big_data_export_desc')}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card: Usuarios */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <UserSquare2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('professionals')}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-grow">
              {t('professionals_desc')}
            </p>

            <button
              onClick={() => handleExport('users')}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isExporting === 'users' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export_users_csv')}
                </>
              )}
            </button>
          </motion.div>

          {/* Card: Patients */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('patients')}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-grow">
              {t('patients_db_desc')}
            </p>

            <button
              onClick={() => handleExport('patients')}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isExporting === 'patients' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export_patients_csv')}
                </>
              )}
            </button>
          </motion.div>

          {/* Card: Evoluciones */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('periodontograms')}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-grow">
              {t('periodontograms_desc')}
            </p>
            
            <button
              onClick={() => handleExport('evolutions')}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isExporting === 'evolutions' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export_periodontograms')}
                </>
              )}
            </button>
          </motion.div>

          {/* Card: Sitios Periodontales */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('periodontal_sites')}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-grow">
              {t('periodontal_sites_desc')}
            </p>

            <button
              onClick={() => handleExport('sites')}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isExporting === 'sites' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export_sites_csv')}
                </>
              )}
            </button>
          </motion.div>

          {/* Card: Dashboards */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboards')}</h3>
            <p className="text-slate-500 text-sm mb-4 flex-grow">
              {t('dashboards_desc')}
            </p>

            <button
              onClick={() => handleExport('dashboards')}
              disabled={isExporting !== null}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isExporting === 'dashboards' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('export_dashboards_csv')}
                </>
              )}
            </button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-bold text-slate-900">{t('usage_metrics')}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <button onClick={setToday} className="px-3 py-1 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">Hoy</button>
                <button onClick={setYesterday} className="px-3 py-1 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">Ayer</button>
                <button onClick={() => setPresetDate(7)} className="px-3 py-1 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">Últimos 7 días</button>
                <button onClick={() => setPresetDate(28)} className="px-3 py-1 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">Últimas 4 semanas</button>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border-none bg-transparent focus:ring-0 text-sm font-medium text-slate-700"
                />
                <span className="text-slate-300">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border-none bg-transparent focus:ring-0 text-sm font-medium text-slate-700"
                />
              </div>
            </div>
          </div>
          <AdminMetrics startDate={startDate} endDate={endDate} />
        </motion.div>
      </motion.main>
    </div>
  );
}
