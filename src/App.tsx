import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import WhatsAppFAB from './components/WhatsAppFAB';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Contact from './pages/Contact';
import FAQs from './pages/FAQs';
import WhyFree from './pages/WhyFree';
import Partners from './pages/Partners';
import APIPage from './pages/APIPage';
import CookiePolicy from './pages/CookiePolicy';
import LegalNotice from './pages/LegalNotice';
import TermsOfUse from './pages/TermsOfUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <CookieConsent />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <WhatsAppFAB />
        <main className="flex-grow pt-16">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/why-free" element={<WhyFree />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/api" element={<APIPage />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/legal-notice" element={<LegalNotice />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
