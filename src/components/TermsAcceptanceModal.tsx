import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';

interface TermsAcceptanceModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function TermsAcceptanceModal({ isOpen, onAccept }: TermsAcceptanceModalProps) {
  const { t } = useTranslation();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDentalProfessional, setIsDentalProfessional] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[80] p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t('terms_and_conditions')}</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded mt-1"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
                  {t('agree_to_terms_part1')} <a href="/terms-of-use.html" target="_blank" className="text-teal-600 hover:underline">{t('terms_of_use')}</a> {t('and')} <a href="/privacy-notice.html" target="_blank" className="text-teal-600 hover:underline">{t('privacy_notice')}</a>.
                </label>
              </div>
              <div className="flex items-start">
                <input
                  id="professional"
                  type="checkbox"
                  checked={isDentalProfessional}
                  onChange={(e) => setIsDentalProfessional(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded mt-1"
                />
                <label htmlFor="professional" className="ml-2 block text-sm text-slate-700">
                  {t('confirm_dental_professional')}
                </label>
              </div>
            </div>
            <button
              onClick={onAccept}
              disabled={!agreedToTerms || !isDentalProfessional}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium disabled:opacity-50 transition-colors"
            >
              {t('accept_and_continue')}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
