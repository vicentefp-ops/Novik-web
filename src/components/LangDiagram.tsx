import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { useTranslation } from 'react-i18next';

export function LangDiagram() {
  const { t } = useTranslation();
  const currentPeriodontogram = useStore((state) => state.currentPeriodontogram);
  const updateLangDiagram = useStore((state) => state.updateLangDiagram);

  const [bop, setBop] = useState<number>(currentPeriodontogram?.langDiagram?.bop ?? 10);
  const [pockets, setPockets] = useState<number>(currentPeriodontogram?.langDiagram?.pockets ?? 2);
  const [toothLoss, setToothLoss] = useState<number>(currentPeriodontogram?.langDiagram?.toothLoss ?? 1);
  const [blAge, setBlAge] = useState<number>(currentPeriodontogram?.langDiagram?.blAge ?? 0.5);
  const [systemic, setSystemic] = useState<string>(currentPeriodontogram?.langDiagram?.systemic ?? 'no');
  const [smoking, setSmoking] = useState<string>(currentPeriodontogram?.langDiagram?.smoking ?? 'non-smoker');

  useEffect(() => {
    updateLangDiagram({
      bop,
      pockets,
      toothLoss,
      blAge,
      systemic,
      smoking
    });
  }, [bop, pockets, toothLoss, blAge, systemic, smoking, updateLangDiagram]);

  // Normalize values for the radar chart (0-100 scale)
  const normalize = (val: number, max: number) => Math.min(100, (val / max) * 100);

  const getSystemicValue = () => systemic === 'yes' ? 100 : 0;
  const getSmokingValue = () => {
    switch (smoking) {
      case 'non-smoker': return 0;
      case 'former': return 25;
      case 'light': return 50;
      case 'moderate': return 75;
      case 'heavy': return 100;
      default: return 0;
    }
  };

  const data = [
    { subject: t('bleeding_probing'), A: normalize(bop, 30), fullMark: 100 },
    { subject: t('residual_pockets_5mm'), A: normalize(pockets, 12), fullMark: 100 },
    { subject: t('teeth_lost'), A: normalize(toothLoss, 10), fullMark: 100 },
    { subject: t('bone_loss_age_ratio'), A: normalize(blAge, 1.5), fullMark: 100 },
    { subject: t('systemic_condition'), A: getSystemicValue(), fullMark: 100 },
    { subject: t('smoking'), A: getSmokingValue(), fullMark: 100 },
  ];

  return (
    <div className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('lang_diagram_title')}</h2>
          <p className="text-sm text-slate-500">{t('pra_assessment')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bleeding_probing')}</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('residual_pockets_5mm')}</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={pockets === 0 ? '' : pockets} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPockets(val === '' ? 0 : parseInt(val, 10));
              }}
              placeholder="0"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('teeth_lost')}</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={toothLoss === 0 ? '' : toothLoss} 
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setToothLoss(val === '' ? 0 : parseInt(val, 10));
              }}
              placeholder="0"
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('bone_loss_age_ratio')}</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('systemic_condition')}</label>
            <select 
              value={systemic} 
              onChange={(e) => setSystemic(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="no">{t('no')}</option>
              <option value="yes">{t('yes_diabetes')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t('smoking')}</label>
            <select 
              value={smoking} 
              onChange={(e) => setSmoking(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="non-smoker">{t('non_smoker')}</option>
              <option value="former">{t('former_smoker')}</option>
              <option value="light">{t('light_smoker')}</option>
              <option value="moderate">{t('moderate_smoker')}</option>
              <option value="heavy">{t('heavy_smoker')}</option>
            </select>
          </div>
        </div>

        <div className="h-[400px] bg-slate-50 rounded-xl border border-slate-100 p-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name={t('risk')} dataKey="A" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
