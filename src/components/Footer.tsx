import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
// import logo from '../assets/logo.png';
const logo = '/logo.png';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img 
                src={logo} 
                alt="Novik Logo" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed">
              AI decision support for dentistry. Making complex data simple, safe, and actionable for faster, safer clinical results.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Navigation</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/why-free" className="hover:text-primary transition-colors">Why Free</Link></li>
              <li><Link to="/partners" className="hover:text-primary transition-colors">Partners</Link></li>
              <li><Link to="/api" className="hover:text-primary transition-colors">API</Link></li>
              <li><Link to="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/legal-notice" className="hover:text-primary transition-colors">Legal Notice</Link></li>
              <li><Link to="/terms-of-use" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://wa.me/34690957910" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-green-500 hover:text-white transition-all" aria-label="Contact us via WhatsApp" title="WhatsApp Support">
                <MessageCircle size={20} />
              </a>
              <a href="https://facebook.com/dentalnovik" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Follow Novik AI on Facebook" title="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com/dentalnovik" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Follow Novik AI on Instagram" title="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/company/novik-ai/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="bg-slate-800 p-2.5 rounded-full hover:bg-primary hover:text-white transition-all" aria-label="Follow Novik AI on LinkedIn" title="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Novik AI. All rights reserved. Smarter Dental Decisions.</p>
        </div>
      </div>
    </footer>
  );
}
