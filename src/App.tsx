import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store/useStore';
import { UserSettings } from './types';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patients } from './pages/Patients';
import { PatientDetail } from './pages/PatientDetail';
import { PeriodontogramView } from './pages/PeriodontogramView';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';
import { EditPatient } from './pages/EditPatient';
import { ClinicOnboardingModal } from './components/ClinicOnboardingModal';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';
import { TermsAcceptanceModal } from './components/TermsAcceptanceModal';
import { ScrollToTop } from './components/ScrollToTop';
import { db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/PageTransition';
import './i18n';

import { fetchWithRetry } from './lib/firestore-utils';

import { PatientSummary } from './pages/PatientSummary';

export default function App() {
  const { user, setUser, settings, setSettings, replaceSettings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const currentUserId = useStore.getState().userId;
        if (currentUserId && currentUserId !== currentUser.uid) {
          useStore.getState().clearStore();
        }
      } else {
        useStore.getState().clearStore();
      }
      
      setUser(currentUser);
      
      if (currentUser) {
        // Load settings asynchronously without blocking
        if (db) {
          const settingsRef = doc(db, 'userSettings', currentUser.uid);
          fetchWithRetry(() => getDoc(settingsRef))
            .then(async (settingsDoc) => {
              if (settingsDoc.exists()) {
                const data = settingsDoc.data() as any;
                if (useStore.getState().settings.termsAccepted) {
                  data.termsAccepted = true;
                }
                replaceSettings(data);
              } else {
                // Initialize default settings
                const defaultSettings: any = {
                  language: 'es', // Default to Spanish if skipped, but modal will force selection
                  numberingSystem: 'FDI',
                  voiceLanguage: 'es',
                  languageConfirmed: false,
                  termsAccepted: false,
                  showHealthScore: true,
                  createdAt: new Date().toISOString()
                };
                await setDoc(settingsRef, defaultSettings);
                replaceSettings(defaultSettings);
              }
              
              // Track daily login
              const today = new Date().toISOString().split('T')[0];
              const loginRef = doc(db, 'login_events', `${currentUser.uid}_${today}`);
              setDoc(loginRef, {
                userId: currentUser.uid,
                date: today,
                timestamp: new Date().toISOString()
              }, { merge: true }).catch(e => console.error("Error tracking login:", e));
            })
            .catch((error: any) => {
              if (error.code === 'unavailable' || error.message?.includes('offline')) {
                console.warn("App is offline, using default/cached settings.");
              } else {
                console.error("Error fetching user settings:", error);
              }
            });
        }

        if (window.location.pathname === '/login') {
          navigate('/');
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, navigate, setSettings]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Firebase Configuration Missing</h1>
          <p className="text-gray-600 mb-4">
            Please add your Firebase configuration to the environment variables in AI Studio.
          </p>
          <pre className="text-left bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/report/:id" element={<PatientSummary />} />
          <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="patients" element={<PageTransition><Patients /></PageTransition>} />
            <Route path="patients/:id" element={<PageTransition><PatientDetail /></PageTransition>} />
            <Route path="patients/:id/edit" element={<PageTransition><EditPatient /></PageTransition>} />
            <Route path="patients/:patientId/periodontogram/:id" element={<PageTransition><PeriodontogramView /></PageTransition>} />
            <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
      <LanguageSelectionModal />
      <ClinicOnboardingModal />
      <TermsAcceptanceModal 
        isOpen={user !== null && settings !== null && settings.termsAccepted !== true}
        onAccept={async () => {
          if (!user || !db) return;
          setSettings({ termsAccepted: true });
          try {
            const settingsRef = doc(db, 'userSettings', user.uid);
            await setDoc(settingsRef, { termsAccepted: true }, { merge: true });
          } catch (error) {
            console.error("Error saving terms acceptance:", error);
          }
        }} 
      />
    </>
  );
}
