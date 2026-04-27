import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, User, LogOut, Menu, X, ShieldAlert, HeartPulse, Bell, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNotifications } from '../lib/useNotifications';
import { useLanguage } from '../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { userData, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, translate } = useLanguage();
  const { unreadCount } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: translate('nav.home'), path: '/' },
    { name: translate('nav.doctors'), path: '/doctors' },
    { name: translate('nav.contact'), path: '/contact' },
  ];

  if (userData?.role === 'admin') {
    navLinks.push({ name: translate('nav.admin'), path: '/admin' });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-brand/20">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-2 italic">
                ESTASHARNI <span className="text-brand not-italic">استشارني</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className={cn("hidden md:flex items-center", language === 'ar' ? "space-x-reverse space-x-8" : "space-x-8")}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-sky-400",
                    location.pathname === link.path 
                      ? "text-sky-400" 
                      : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className={cn("hidden md:flex items-center", language === 'ar' ? "space-x-reverse space-x-4" : "space-x-4")}>
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {userData ? (
                <div className={cn("flex items-center", language === 'ar' ? "space-x-reverse space-x-4" : "space-x-4")}>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 p-1.5 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 relative"
                  >
                    {userData.photoURL ? (
                      <img src={userData.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <span className="text-sm font-bold">{userData.displayName || translate('nav.profile')}</span>
                    
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-lg border-2 border-white dark:border-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
                >
                  Join Us
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center space-x-2">
               <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                <Globe className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] font-black">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>
               <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-slate-600 dark:text-slate-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {userData ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium bg-sky-400 text-white text-center mt-4"
                  >
                    Join Us
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-800/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl dark:text-white">Estasharni</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-loose text-sm italic">
                "Empowering humans to take control of their health through specialized virtual consultations with top medical professionals."
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li><Link to="/doctors" className="hover:text-brand transition-colors">Find Doctors</Link></li>
                <li><Link to="/auth" className="hover:text-brand transition-colors">Doctor Registration</Link></li>
                <li><Link to="/contact" className="hover:text-brand transition-colors">Support Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-slate-900 dark:text-white">Connect</h4>
              <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                <li>support@estasharni.com</li>
                <li>+1 (555) 123-4567</li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Available Worldwide
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Estasharni Platform. Secure & Certified.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
