import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDentalProfessional, setIsDentalProfessional] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'userSettings', userCredential.user.uid), { termsAccepted: true }, { merge: true });
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError(t('login_error_disabled'));
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError(t('login_error_invalid'));
      } else if (err.code === 'auth/email-already-in-use') {
        setError(t('login_error_exists'));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!email) {
      setError(t('enter_email_for_reset'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError(t('no_account_found'));
      } else if (err.code === 'auth/invalid-email') {
        setError(t('invalid_email'));
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // Ignore if user just closed the popup
        return;
      }
      setError(err.message);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <motion.div variants={itemVariants} className="flex justify-center">
          <img src="/logo_texto.png" alt="PerioVox" className="h-16 w-auto object-contain" />
        </motion.div>
        <motion.h2 variants={itemVariants} className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {t('app_name')}
        </motion.h2>
        <motion.p variants={itemVariants} className="mt-2 text-center text-sm text-slate-600">
          {isForgotPassword 
            ? t('reset_password') 
            : isLogin 
              ? t('sign_in_to_account') 
              : t('create_new_account')}
        </motion.p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.form 
                key="forgot-password"
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6" 
                onSubmit={handleResetPassword}
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                  >
                    {error}
                  </motion.div>
                )}
                
                {resetEmailSent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm"
                  >
                    {t('reset_email_sent')}
                  </motion.div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        {t('email')}
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                          placeholder="doctor@clinic.com"
                        />
                      </div>
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                      >
                        {t('send_reset_link')}
                      </button>
                    </div>
                  </>
                )}

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetEmailSent(false);
                      setError('');
                    }}
                    className="text-sm font-medium text-teal-600 hover:text-teal-500 flex items-center justify-center w-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('back_to_login')}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key={isLogin ? 'login' : 'register'}
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {error}
                      {error === t('login_error_invalid') && isLogin && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setError('');
                              setResetEmailSent(false);
                            }}
                            className="font-medium text-teal-600 hover:text-teal-500 underline"
                          >
                            {t('forgot_password')}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      {t('email')}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                        placeholder="doctor@clinic.com"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-700">
                        {t('password')}
                      </label>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 border"
                        placeholder="••••••••"
                      />
                    </div>
                    {isLogin && (
                      <div className="mt-2 flex justify-end text-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setError('');
                            setResetEmailSent(false);
                          }}
                          className="font-medium text-teal-600 hover:text-teal-500"
                        >
                          {t('forgot_password')}
                        </button>
                      </div>
                    )}
                  </div>

                  {!isLogin && (
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded mt-1"
                          required
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
                          required
                        />
                        <label htmlFor="professional" className="ml-2 block text-sm text-slate-700">
                          {t('confirm_dental_professional')}
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading || (!isLogin && (!agreedToTerms || !isDentalProfessional))}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
                    >
                      {isLogin ? (
                        <><LogIn className="w-5 h-5 mr-2" /> {t('sign_in')}</>
                      ) : (
                        <><UserPlus className="w-5 h-5 mr-2" /> {t('register')}</>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">{t('or_continue_with')}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t('sign_in_google')}
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-medium text-teal-600 hover:text-teal-500"
                  >
                    {isLogin ? t('dont_have_account') : t('already_have_account')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
