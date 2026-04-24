import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, FileText, Calendar } from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface AdminMetricsProps {
  startDate: string;
  endDate: string;
}

export function AdminMetrics({ startDate, endDate }: AdminMetricsProps) {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'userSettings'));
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const loginsSnap = await getDocs(collection(db, 'login_events'));
      const logins = loginsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const periosSnap = await getDocs(collection(db, 'periodontograms'));
      const perios = periosSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const isSingleDay = startDate === endDate;
      const chartData: any[] = [];

      if (isSingleDay) {
        for (let i = 0; i < 24; i++) {
          const hourStr = i.toString().padStart(2, '0') + ':00';
          chartData.push({
            date: hourStr,
            [t('new_users')]: 0,
            [t('logins')]: 0,
            [t('periodontograms_plural')]: 0
          });
        }
      } else {
        const dates: string[] = [];
        let curr = new Date(startDate);
        const end = new Date(endDate);
        while (curr <= end) {
          dates.push(curr.toISOString().split('T')[0]);
          curr.setDate(curr.getDate() + 1);
        }

        dates.forEach(date => {
          chartData.push({
            date,
            [t('new_users')]: 0,
            [t('logins')]: 0,
            [t('periodontograms_plural')]: 0
          });
        });
      }

      const countryData = {
        users: {} as Record<string, number>,
        logins: {} as Record<string, number>,
        perios: {} as Record<string, number>
      };

      const getCountry = (userId: string) => {
        const user = users.find(u => u.id === userId);
        return user?.clinicInfo?.country || t('unknown_country');
      };

      users.forEach(u => {
        if (u.createdAt) {
          const date = u.createdAt.split('T')[0];
          if (date >= startDate && date <= endDate) {
            let key = date;
            if (isSingleDay) {
              const hour = new Date(u.createdAt).getHours();
              key = hour.toString().padStart(2, '0') + ':00';
            }
            const chartItem = chartData.find(d => d.date === key);
            if (chartItem) chartItem[t('new_users')]++;
            
            const country = u.clinicInfo?.country || t('unknown_country');
            countryData.users[country] = (countryData.users[country] || 0) + 1;
          }
        }
      });

      logins.forEach(l => {
        const date = l.date;
        if (date >= startDate && date <= endDate) {
          let key = date;
          if (isSingleDay && l.timestamp) {
            const hour = new Date(l.timestamp).getHours();
            key = hour.toString().padStart(2, '0') + ':00';
          } else if (isSingleDay) {
             key = '00:00'; // fallback
          }
          const chartItem = chartData.find(d => d.date === key);
          if (chartItem) chartItem[t('logins')]++;
          
          const country = getCountry(l.userId);
          countryData.logins[country] = (countryData.logins[country] || 0) + 1;
        }
      });

      perios.forEach(p => {
        if (p.date) {
          const date = p.date.split('T')[0];
          if (date >= startDate && date <= endDate) {
            let key = date;
            if (isSingleDay) {
              const hour = new Date(p.date).getHours();
              key = hour.toString().padStart(2, '0') + ':00';
            }
            const chartItem = chartData.find(d => d.date === key);
            if (chartItem) chartItem[t('periodontograms_plural')]++;
            
            const country = getCountry(p.userId);
            countryData.perios[country] = (countryData.perios[country] || 0) + 1;
          }
        }
      });

      // Convert country data to arrays for tables
      const formatCountryData = (data: Record<string, number>) => {
        return Object.entries(data)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count);
      };

      setMetrics({
        chartData,
        tables: {
          users: formatCountryData(countryData.users),
          logins: formatCountryData(countryData.logins),
          perios: formatCountryData(countryData.perios)
        }
      });
    } catch (err) {
      console.error("Error loading metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [startDate, endDate]);

  const renderTable = (title: string, data: { country: string, count: number }[], icon: React.ReactNode) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-slate-800">{title} {t('by_country')}</h3>
      </div>
      <div className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-500">
            <tr>
              <th className="px-6 py-3 font-medium">{t('country_col')}</th>
              <th className="px-6 py-3 font-medium text-right">{t('amount_col')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-slate-500">{t('no_data_period')}</td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-700">{row.country}</td>
                  <td className="px-6 py-3 text-right text-slate-600 font-mono">{row.count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 mt-6">
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium">{t('loading_metrics')}</div>
        </div>
      ) : metrics ? (
        <>
          {/* Charts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              {t('temporal_evolution')}
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" fontSize={12} tick={{ fill: '#64748b' }} />
                  <YAxis fontSize={12} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Line type="monotone" dataKey={t('new_users')} stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey={t('logins')} stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey={t('periodontograms_plural')} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderTable(t('new_users'), metrics.tables.users, <Users className="w-5 h-5 text-sky-500" />)}
            {renderTable(t('logins'), metrics.tables.logins, <Activity className="w-5 h-5 text-purple-500" />)}
            {renderTable(t('periodontograms_plural'), metrics.tables.perios, <FileText className="w-5 h-5 text-emerald-500" />)}
          </div>
        </>
      ) : null}
    </div>
  );
}
