import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';

export function IDRAAssessment() {
  const { t } = useTranslation();
  const currentPeriodontogram = useStore((state) => state.currentPeriodontogram);
  const updateIDRA = useStore((state) => state.updateIDRA);

  const [history, setHistory] = useState<string>(currentPeriodontogram?.idra?.history ?? 'no');
  const [bop, setBop] = useState<number>(currentPeriodontogram?.idra?.bop ?? 5);
  const [pd, setPd] = useState<number>(currentPeriodontogram?.idra?.pd ?? 0);
  const [blAge, setBlAge] = useState<number>(currentPeriodontogram?.idra?.blAge ?? 0.3);
  const [susceptibility, setSusceptibility] = useState<string>(currentPeriodontogram?.idra?.susceptibility ?? 'low');
  const [spt, setSpt] = useState<string>(currentPeriodontogram?.idra?.spt ?? 'compliant');
  const [distance, setDistance] = useState<string>(currentPeriodontogram?.idra?.distance ?? 'high');
  const [prosthesis, setProsthesis] = useState<string>(currentPeriodontogram?.idra?.prosthesis ?? 'good');

  useEffect(() => {
    updateIDRA({
      history,
      bop,
      pd,
      blAge,
      susceptibility,
      spt,
      distance,
      prosthesis
    });
  }, [history, bop, pd, blAge, susceptibility, spt, distance, prosthesis, updateIDRA]);

  const getRiskValue = (val: string | number, type?: 'bop' | 'pd' | 'blAge') => {
    if (type === 'bop') {
      const v = val as number;
      if (v < 10) return 20;
      if (v < 30) return 60;
      return 100;
    }
    if (type === 'pd') {
      const v = val as number;
      if (v === 0) return 20;
      if (v === 1) return 60;
      return 100;
    }
    if (type === 'blAge') {
      const v = val as number;
      if (v < 0.5) return 20;
      if (v <= 1.0) return 60;
      return 100;
    }

    switch (val) {
      case 'no': case 'low': case '0': case 'compliant': case 'high': case 'good': return 20;
      case 'stable': case 'moderate': case '1': case 'erratic': case 'medium': case 'fair': return 60;
      case 'unstable': case 'high_risk': case '2+': case 'non-compliant': case 'low_dist': case 'poor': return 100;
      default: return 20;
    }
  };

  const data = [
    { subject: t('history_periodontitis'), A: getRiskValue(history), fullMark: 100 },
    { subject: t('bop_percent'), A: getRiskValue(bop, 'bop'), fullMark: 100 },
    { subject: t('residual_pockets'), A: getRiskValue(pd, 'pd'), fullMark: 100 },
    { subject: t('bone_loss_age'), A: getRiskValue(blAge, 'blAge'), fullMark: 100 },
    { subject: t('periodontal_susceptibility'), A: getRiskValue(susceptibility), fullMark: 100 },
    { subject: t('maintenance_compliance'), A: getRiskValue(spt), fullMark: 100 },
    { subject: t('bone_margin_distance'), A: getRiskValue(distance), fullMark: 100 },
    { subject: t('prosthesis_fit'), A: getRiskValue(prosthesis), fullMark: 100 },
  ];

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('idra_title')}</h2>
          <p className="text-sm text-slate-500">Implant Disease Risk Assessment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('history_periodontitis')}</label>
            <select value={history} onChange={(e) => setHistory(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              <option value="no">{t('no')}</option>
              <option value="stable">{t('treated_stable')}</option>
              <option value="unstable">{t('treated_unstable')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bop_percent')}</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={bop === 0 ? '' : bop} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setBop(val === '' ? 0 : Math.min(100, parseInt(val, 10)));
              }}
              placeholder="0"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('residual_pockets')}</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={pd === 0 ? '' : pd} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPd(val === '' ? 0 : parseInt(val, 10));
              }}
              placeholder="0"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bone_loss_age')}</label>
            <input 
              type="text" 
              inputMode="decimal"
              value={blAge === 0 ? '' : blAge} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                if (val === '' || val === '.') {
                  setBlAge(0);
                } else {
                  setBlAge(parseFloat(val));
                }
              }}
              placeholder="0.0"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('periodontal_susceptibility')}</label>
            <select value={susceptibility} onChange={(e) => setSusceptibility(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              <option value="low">{t('low')}</option>
              <option value="moderate">{t('moderate')}</option>
              <option value="high_risk">{t('high_risk')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('maintenance_compliance')}</label>
            <select value={spt} onChange={(e) => setSpt(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              <option value="compliant">{t('compliant')}</option>
              <option value="erratic">{t('erratic')}</option>
              <option value="non-compliant">{t('non_compliant')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bone_margin_distance')}</label>
            <select value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              <option value="high">&gt; 1.5 mm</option>
              <option value="medium">1.5 - 0.5 mm</option>
              <option value="low_dist">&lt; 0.5 mm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('prosthesis_fit')}</label>
            <select value={prosthesis} onChange={(e) => setProsthesis(e.target.value)} className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500">
              <option value="good">{t('good')}</option>
              <option value="fair">{t('fair')}</option>
              <option value="poor">{t('poor')}</option>
            </select>
          </div>
        </div>

        <div className="h-[400px] bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name={t('risk')} dataKey="A" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
