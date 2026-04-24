import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Users, Settings as SettingsIcon, LogOut, Menu, X, Database } from 'lucide-react';
import { Logo } from './Logo';
import { useStore } from '../store/useStore';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, clearStore } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      clearStore();
    }
  };

  const isAdmin = user?.email?.toLowerCase().trim() === 'vicentefp@gmail.com';

  const navItems = [
    { path: '/', label: t('dashboard'), icon: Activity },
    { path: '/patients', label: t('patients'), icon: Users },
    { path: '/settings', label: t('settings'), icon: SettingsIcon },
    ...(isAdmin ? [{ path: '/admin', label: t('admin_panel'), icon: Database }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <img src="/logo_texto.png" alt="PerioVox" className="h-8 w-auto object-contain" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                             (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-teal-50 text-teal-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 mr-3",
                  isActive ? "text-teal-600" : "text-slate-400"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold mr-3">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.displayName || t('user')}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl lg:hidden"
            >
              <div className="h-full flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200">
                  <img src="/logo_texto.png" alt="PerioVox" className="h-8 w-auto object-contain" />
                  <button 
                    className="ml-auto text-slate-500 hover:text-slate-700 p-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                                     (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-teal-50 text-teal-700" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <item.icon className={cn(
                          "w-5 h-5 mr-3",
                          isActive ? "text-teal-600" : "text-slate-400"
                        )} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-slate-200">
                  <div className="flex items-center px-3 py-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold mr-3">
                      {user?.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {user?.displayName || t('user')}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden">
          <div className="flex items-center">
            <img src="/logo_texto.png" alt="PerioVox" className="h-8 w-auto object-contain" />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
