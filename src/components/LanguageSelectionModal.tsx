import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LanguageSelectionModal() {
  const { t, i18n } = useTranslation();
  const { user, settings, setSettings } = useStore();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show if user is logged in and language is NOT confirmed
  // Also, if clinicInfo is already present, we assume language was confirmed (legacy users)
  // Do not show if terms are not accepted yet
  if (!user || settings.languageConfirmed || settings.clinicInfo || settings.termsAccepted !== true) return null;

  const handleSubmit = async () => {
    if (!user || !db) return;

    setIsSubmitting(true);
    try {
      const userSettingsRef = doc(db, 'userSettings', user.uid);
      const newSettings = {
        language: selectedLanguage,
        languageConfirmed: true,
      };

      // Update local state and i18n immediately for better UX
      // This will trigger the modal to close immediately via the early return
      setSettings(newSettings);
      i18n.changeLanguage(selectedLanguage);

      // Save to Firestore in the background without awaiting to avoid UI lag
      setDoc(userSettingsRef, newSettings, { merge: true }).catch(err => {
        console.error("Error saving language preference in background:", err);
      });
      
    } catch (error) {
      console.error("Error in language submission:", error);
      alert(t('error_saving_language'));
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {user && !settings.languageConfirmed && !settings.clinicInfo && settings.termsAccepted === true && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('welcome')}</h2>
              <p className="text-slate-500 mb-8">
                {t('select_language_desc')}
              </p>

              <div className="space-y-3 mb-8">
                <button
                  onClick={() => setSelectedLanguage('en')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedLanguage === 'en'
                      ? 'border-teal-600 bg-teal-50 text-teal-600'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{t('english')}</span>
                  {selectedLanguage === 'en' && <Check className="w-5 h-5 text-teal-600" />}
                </button>

                <button
                  onClick={() => setSelectedLanguage('es')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    selectedLanguage === 'es'
                      ? 'border-teal-600 bg-teal-50 text-teal-600'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="font-medium">{t('spanish')}</span>
                  {selectedLanguage === 'es' && <Check className="w-5 h-5 text-teal-600" />}
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('saving') : t('continue')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
