import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
// import logo from '../assets/logo.png';
const logo = '/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'FAQs', path: '/faqs' },
    { name: 'Why Free', path: '/why-free' },
    { name: 'Partners', path: '/partners' },
    { name: 'API', path: '/api' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass h-20' : 'bg-white h-24'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <Link to="/" className="flex items-center gap-2 group h-full" aria-label="Novik AI Home" title="Novik AI - Professional Dental Clinical Support">
            <img src={logo} alt="Novik AI Logo" className="h-full w-auto object-contain" width="160" height="60" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-slate-700'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <a href="https://app.novik.ai" className="btn-primary text-sm">
              Login
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-slate-600 p-2"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-slate-700 hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
          <a href="https://app.novik.ai" onClick={() => setIsOpen(false)} className="btn-primary text-center">
            Login
          </a>
        </div>
      )}
    </header>
  );
}
