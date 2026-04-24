import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Activity, ShieldCheck, UserPlus, Stethoscope, ArrowRight, Target, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Periodontogram, Patient } from '../types';
import { calculateHealthScore } from '../utils/calculations';
import { InfoTooltip } from '../components/InfoTooltip';

export function Dashboard() {
  const { t } = useTranslation();
  const { user, patients, setPatients, settings } = useStore();
  const [loading, setLoading] = useState(true);
  const [periodontograms, setPeriodontograms] = useState<Periodontogram[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !db) return;
      setLoading(true);
      try {
        const qPatients = query(collection(db, 'patients'), where('userId', '==', user.uid));
        const patientsSnapshot = await getDocs(qPatients);
        const patientsData = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Patient[];
        setPatients(patientsData);

        const qPerios = query(collection(db, 'periodontograms'), where('userId', '==', user.uid));
        const periosSnapshot = await getDocs(qPerios);
        const periosData = periosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Periodontogram[];
        setPeriodontograms(periosData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setPatients]);

  const dashboardData = useMemo(() => {
    try {
      if (!patients.length || !periodontograms.length) return null;

      const patientHistories = patients.map(patient => {
        const patientPerios = periodontograms
          .filter(p => p.patientId === patient.id)
          .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()); // Oldest first

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
          patient,
          scores,
          firstScore,
          latestScore,
          improvement,
          cohort,
          relapsed,
          hasMultiple,
          lastDate: patientPerios[patientPerios.length - 1].date
        };
      }).filter(Boolean) as any[];

      if (patientHistories.length === 0) return null;

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
        cohorts: {
          baseline: { count: baselinePatients.length, avgScore: avgBaselineScore },
          treatment: { count: treatmentPatients.length, avgImprovement: avgTreatmentImprovement },
          maintenance: { count: maintenancePatients.length, avgScore: avgMaintenanceScore }
        },
        impact: {
          avgImprovement: avgGlobalImprovement,
          improvedPercent,
          stablePercent,
          worsenedPercent,
          relapsePercent,
          stabilizedPercent,
          trackedCount: trackedPatients.length
        },
        recentPatients: patientHistories.sort((a, b) => new Date(b.lastDate || 0).getTime() - new Date(a.lastDate || 0).getTime()).slice(0, 5)
      };
    } catch (err) {
      console.error("Error calculating dashboard data:", err);
      return null;
    }
  }, [patients, periodontograms]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('welcome_back', { name: settings?.doctorName || user?.displayName?.split(' ')[0] || t('user') })}
        </h1>
        <div>
          <Link to="/patients" className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors">
            <Users className="w-4 h-4 mr-2" />
            {t('patients')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-500">{t('loading')}</div>
      ) : !dashboardData ? (
        <div className="h-64 flex items-center justify-center text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm px-6 text-center">
          {t('not_enough_data_dashboard')}
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. CLINICAL IMPACT */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Target className="w-48 h-48 text-teal-600" />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <Activity className="w-6 h-6 text-teal-600" />
              {t('global_clinical_impact')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Mejora Media */}
              <div className="md:col-span-1 border-r border-slate-100 pr-8">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t('average_improvement')}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-black tracking-tighter ${dashboardData.impact.avgImprovement >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {dashboardData.impact.avgImprovement > 0 ? '+' : ''}{dashboardData.impact.avgImprovement}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-slate-400">{t('pts')}</span>
                    <div className="flex items-center gap-1 ml-2 bg-slate-50 px-2 py-1 rounded-md">
                      <span className="text-xs font-medium text-slate-500">{t('health_score')}</span>
                      <InfoTooltip text={t('health_score_explanation')} iconClassName="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 mt-2">{t('per_patient_in_treatment')}</p>
              </div>

              {/* Distribución de Evolución */}
              <div className="md:col-span-2 flex flex-col justify-center px-4">
                <div className="flex justify-between text-sm font-bold mb-3">
                  <span className="text-emerald-600">{dashboardData.impact.improvedPercent}% {t('improve')}</span>
                  <span className="text-slate-400">{dashboardData.impact.stablePercent}% {t('stable')}</span>
                  <span className="text-red-500">{dashboardData.impact.worsenedPercent}% {t('worsen')}</span>
                </div>
                <div className="w-full h-4 flex rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${dashboardData.impact.improvedPercent}%` }} />
                  <div className="bg-slate-300 h-full transition-all" style={{ width: `${dashboardData.impact.stablePercent}%` }} />
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${dashboardData.impact.worsenedPercent}%` }} />
                </div>
                <p className="text-xs font-medium text-slate-400 mt-3 text-center">
                  {t('based_on')} {dashboardData.impact.trackedCount} {t('patients_with_followup')}
                </p>
              </div>

              {/* KPIs Secundarios */}
              <div className="md:col-span-1 flex flex-col justify-center gap-4 pl-4 border-l border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('stabilized_patients')}</p>
                  <p className="text-2xl font-black text-teal-600">{dashboardData.impact.stabilizedPercent}%</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('relapse_rate')}</p>
                  <p className={`text-2xl font-black ${dashboardData.impact.relapsePercent > 15 ? 'text-red-500' : 'text-slate-700'}`}>
                    {dashboardData.impact.relapsePercent}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. COHORTES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Baseline */}
            <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-600 mb-4">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t('new_patients')}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">{t('diagnostic_phase_baseline')}</p>
              
              <div className="bg-white rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t('initial_score')}</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-700">{dashboardData.cohorts.baseline.avgScore}</span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium text-slate-400">{t('pts')}</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">{t('health_score')}</span>
                      <InfoTooltip text={t('health_score_explanation')} iconClassName="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{t('arrival_context')} ({dashboardData.cohorts.baseline.count} {t('patients_lowercase')})</p>
              </div>
            </div>

            {/* Tratamiento */}
            <div className="bg-teal-50 rounded-3xl border border-teal-100 p-6">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600 mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-teal-900 mb-1">{t('in_treatment')}</h3>
              <p className="text-sm font-medium text-teal-600/80 mb-6">{t('active_improvement_phase')}</p>
              
              <div className="bg-white rounded-2xl p-4 border border-teal-100 shadow-sm">
                <p className="text-xs font-bold text-teal-600/60 uppercase tracking-wider mb-1">{t('average_improvement')}</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-teal-600">
                    {dashboardData.cohorts.treatment.avgImprovement > 0 ? '+' : ''}{dashboardData.cohorts.treatment.avgImprovement}
                  </span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium text-teal-600/60">{t('pts')}</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[10px] font-medium text-teal-600/60 uppercase">{t('health_score')}</span>
                      <InfoTooltip text={t('health_score_explanation')} iconClassName="w-3.5 h-3.5 text-teal-600/60" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-teal-600/80 mt-2">{t('your_direct_impact')} ({dashboardData.cohorts.treatment.count} {t('patients_lowercase')})</p>
              </div>
            </div>

            {/* Mantenimiento */}
            <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">{t('in_maintenance')}</h3>
              <p className="text-sm font-medium text-emerald-600/80 mb-6">{t('control_stability_phase')}</p>
              
              <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
                <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-wider mb-1">{t('average_stability')}</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-emerald-600">{dashboardData.cohorts.maintenance.avgScore}</span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium text-emerald-600/60">{t('pts')}</span>
                    <div className="flex items-center gap-1 ml-1">
                      <span className="text-[10px] font-medium text-emerald-600/60 uppercase">{t('health_score')}</span>
                      <InfoTooltip text={t('health_score_explanation')} iconClassName="w-3.5 h-3.5 text-emerald-600/60" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-emerald-600/80 mt-2">{t('control_capacity')} ({dashboardData.cohorts.maintenance.count} {t('patients_lowercase')})</p>
              </div>
            </div>
          </div>

          {/* 3. ACTIVIDAD RECIENTE */}
          <div className="bg-white shadow-sm rounded-3xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">{t('recent_patient_evolution')}</h3>
              <Link to="/patients" className="text-sm font-bold text-teal-600 hover:text-teal-700">{t('view_all')}</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {dashboardData.recentPatients.length === 0 ? (
                <div className="p-6 text-center text-slate-500">{t('no_patients_found')}</div>
              ) : (
                dashboardData.recentPatients.map((p) => (
                  <div key={p.patient.id}>
                    <Link to={`/patients/${p.patient.id}`} className="block hover:bg-slate-50 transition-colors">
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                            {p.patient.clinicalRecord?.charAt(0) || '#'}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-bold text-slate-900">{p.patient.clinicalRecord}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                p.cohort === 'baseline' ? 'bg-slate-100 text-slate-600' :
                                p.cohort === 'treatment' ? 'bg-teal-100 text-teal-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>
                                {p.cohort === 'baseline' ? t('new_caps') : p.cohort === 'treatment' ? t('in_treatment') : t('maintenance_caps')}
                              </span>
                              <span className="text-xs text-slate-400">{new Date(p.lastDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {p.hasMultiple ? (
                            <div className="flex items-center gap-3">
                              <div className="text-right hidden sm:block">
                                <p className="text-xs font-medium text-slate-400">{t('initial_score')}</p>
                                <p className="text-sm font-bold text-slate-500">{p.firstScore}</p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 hidden sm:block" />
                              <div className="text-right">
                                <p className="text-xs font-medium text-slate-400">{t('current')}</p>
                                <p className="text-lg font-black text-slate-900">{p.latestScore}</p>
                              </div>
                              <div className={`flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm min-w-[3rem] ${
                                p.improvement >= 5 ? 'bg-emerald-50 text-emerald-600' : 
                                p.improvement <= -5 ? 'bg-red-50 text-red-600' : 
                                'bg-slate-50 text-slate-500'
                              }`}>
                                {p.improvement > 0 ? '+' : ''}{p.improvement}
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <p className="text-xs font-medium text-slate-400">{t('initial_score')}</p>
                              <p className="text-lg font-black text-slate-900">{p.firstScore}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
