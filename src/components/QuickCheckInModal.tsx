import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import { Patient } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuickCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  patient: Patient;
}

export function QuickCheckInModal({ isOpen, onClose, onConfirm, patient }: QuickCheckInModalProps) {
  const { t } = useTranslation();
  
  // Initialize with patient's last known data
  const [smokingStatus, setSmokingStatus] = useState(patient.riskFactors?.smokingStatus || 'non-smoker');
  const [cigarettesPerDay, setCigarettesPerDay] = useState(patient.riskFactors?.cigarettesPerDay || '');
  const [diabetesControlled, setDiabetesControlled] = useState(patient.riskFactors?.diabetesControlled || 'unknown');
  const [hypertensionControlled, setHypertensionControlled] = useState(patient.riskFactors?.hypertensionControlled || 'unknown');
  const [brushingFrequency, setBrushingFrequency] = useState(patient.hygieneHabits?.brushingFrequency || '2');
  const [interdentalHygiene, setInterdentalHygiene] = useState<'none' | 'floss' | 'brushes' | 'both'>('none');
  const [usesIrrigator, setUsesIrrigator] = useState(patient.hygieneHabits?.usesIrrigator || false);
  const [lastProfessionalCleaning, setLastProfessionalCleaning] = useState(patient.hygieneHabits?.lastProfessionalCleaning || '0-3-months');
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
    onConfirm({
      smokingStatus,
      cigarettesPerDay,
      diabetesControlled,
      hypertensionControlled,
      brushingFrequency,
      interdentalHygiene,
      usesIrrigator,
      lastProfessionalCleaning,
      comments,
      timestamp: new Date().toISOString()
    });
  };

  const OptionButton = ({ label, active, onClick, className }: { label: string; active: boolean; onClick: () => void; className?: string }) => (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2.5 px-3 sm:py-3 sm:px-4 rounded-xl font-bold text-sm transition-all border-2",
        active 
          ? "bg-teal-50 border-teal-600 text-teal-700 shadow-sm" 
          : "bg-white border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50",
        className
      )}
    >
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity" 
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            </motion.div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all my-4 sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
            >
              <div className="bg-white px-6 pt-6 pb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{t('quick_checkin')}</h3>
                    <p className="text-slate-500 text-sm mt-1">{t('checkin_intro')}</p>
                  </div>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
                  {/* Smoking Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('current_smoking')}</label>
                    <div className="flex gap-3">
                      <OptionButton 
                        label={t('never')} 
                        active={smokingStatus === 'non-smoker'} 
                        onClick={() => setSmokingStatus('non-smoker')} 
                      />
                      <OptionButton 
                        label={t('ex_smoker')} 
                        active={smokingStatus === 'ex-smoker'} 
                        onClick={() => setSmokingStatus('ex-smoker')} 
                      />
                      <OptionButton 
                        label={t('smoker')} 
                        active={smokingStatus === 'smoker'} 
                        onClick={() => setSmokingStatus('smoker')} 
                      />
                    </div>
                    {smokingStatus === 'smoker' && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {['1-5', '5-10', '10-20', '20+'].map(range => (
                          <button
                            key={range}
                            onClick={() => setCigarettesPerDay(range)}
                            className={cn(
                              "py-2 text-xs font-bold rounded-lg border transition-all",
                              cigarettesPerDay === range 
                                ? "bg-teal-600 border-teal-600 text-white" 
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                            )}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {patient.riskFactors?.diabetes && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('diabetes_control')}</label>
                        <div className="flex gap-2">
                          <OptionButton 
                            label={t('yes')} 
                            active={diabetesControlled === 'yes'} 
                            onClick={() => setDiabetesControlled('yes')} 
                            className="py-2 text-xs"
                          />
                          <OptionButton 
                            label={t('no')} 
                            active={diabetesControlled === 'no'} 
                            onClick={() => setDiabetesControlled('no')} 
                            className="py-2 text-xs"
                          />
                          <OptionButton 
                            label={t('unknown')} 
                            active={diabetesControlled === 'unknown'} 
                            onClick={() => setDiabetesControlled('unknown')} 
                            className="py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}
                    {patient.riskFactors?.hypertension && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('hypertension_control')}</label>
                        <div className="flex gap-2">
                          <OptionButton 
                            label={t('yes')} 
                            active={hypertensionControlled === 'yes'} 
                            onClick={() => setHypertensionControlled('yes')} 
                            className="py-2 text-xs"
                          />
                          <OptionButton 
                            label={t('no')} 
                            active={hypertensionControlled === 'no'} 
                            onClick={() => setHypertensionControlled('no')} 
                            className="py-2 text-xs"
                          />
                          <OptionButton 
                            label={t('unknown')} 
                            active={hypertensionControlled === 'unknown'} 
                            onClick={() => setHypertensionControlled('unknown')} 
                            className="py-2 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Habits Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('hygiene_habits')}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-xs text-slate-500 font-medium">{t('brushing_frequency')}</span>
                        <div className="flex gap-2">
                          {['1', '2', '3+'].map(freq => (
                            <OptionButton 
                              key={freq}
                              label={freq} 
                              active={brushingFrequency === freq} 
                              onClick={() => setBrushingFrequency(freq as any)} 
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs text-slate-500 font-medium">{t('uses_irrigator')}</span>
                        <div className="flex gap-2">
                          <OptionButton 
                            label={t('yes')} 
                            active={usesIrrigator === true} 
                            onClick={() => setUsesIrrigator(true)} 
                          />
                          <OptionButton 
                            label={t('no')} 
                            active={usesIrrigator === false} 
                            onClick={() => setUsesIrrigator(false)} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <span className="text-xs text-slate-500 font-medium">{t('last_professional_cleaning')}</span>
                      <div className="flex flex-wrap gap-2">
                        <OptionButton 
                          label={`0-3 ${t('months')}`} 
                          active={lastProfessionalCleaning === '0-3-months'} 
                          onClick={() => setLastProfessionalCleaning('0-3-months')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={`3-6 ${t('months')}`} 
                          active={lastProfessionalCleaning === '3-6-months'} 
                          onClick={() => setLastProfessionalCleaning('3-6-months')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={`6-12 ${t('months')}`} 
                          active={lastProfessionalCleaning === '6-12-months'} 
                          onClick={() => setLastProfessionalCleaning('6-12-months')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={`12-18 ${t('months')}`} 
                          active={lastProfessionalCleaning === '12-18-months'} 
                          onClick={() => setLastProfessionalCleaning('12-18-months')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={`18+ ${t('months')}`} 
                          active={lastProfessionalCleaning === '18+-months'} 
                          onClick={() => setLastProfessionalCleaning('18+-months')} 
                          className="py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <span className="text-xs text-slate-500 font-medium">{t('interdental_hygiene')}</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <OptionButton 
                          label={t('no')} 
                          active={interdentalHygiene === 'none'} 
                          onClick={() => setInterdentalHygiene('none')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={t('floss')} 
                          active={interdentalHygiene === 'floss'} 
                          onClick={() => setInterdentalHygiene('floss')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={t('brushes')} 
                          active={interdentalHygiene === 'brushes'} 
                          onClick={() => setInterdentalHygiene('brushes')} 
                          className="py-2 text-xs"
                        />
                        <OptionButton 
                          label={t('both')} 
                          active={interdentalHygiene === 'both'} 
                          onClick={() => setInterdentalHygiene('both')} 
                          className="py-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('comments')}</label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder={t('add_comments_placeholder')}
                      className="w-full py-3 px-4 rounded-xl border-2 border-slate-100 focus:border-teal-600 focus:ring-0 transition-all text-sm min-h-[100px] resize-y"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 py-4 px-6 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    {t('no_changes')}
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-[2] py-4 px-6 rounded-2xl bg-teal-600 text-white font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    {t('start_periodontogram')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
