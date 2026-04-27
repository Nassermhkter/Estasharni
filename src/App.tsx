import React, { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserData, UserRole } from './types';
import { HeartPulse, Moon, Sun, Bell, LogOut, Menu, User as UserIcon, Headset, Send, X, Heart, ShieldPlus, Search, CalendarCheck, Video, Phone, Mail, ChevronLeft, Star, BriefcaseMedical, Award, ArrowLeft, Plus, Edit, Trash, LayoutDashboard, Inbox, Settings, Users, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context ---
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
  isDoctor: false,
});

export const useAuth = () => useContext(AuthContext);

// --- Components ---
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './components/Chat';
import { Notifications } from './components/Notifications';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('estasharni_dark') === 'true');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          // If user doesn't exist in Firestore, they might be new from social login
          // We'll handle creation in the Auth page, or here as a fallback
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('estasharni_dark', String(isDark));
  }, [isDark]);

  const isAdmin = userData?.role === UserRole.ADMIN;
  const isDoctor = userData?.role === UserRole.DOCTOR;

  const navigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
        >
          <HeartPulse className="text-white w-10 h-10" />
        </motion.div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home navigate={navigate} />;
      case 'doctors': return <Doctors navigate={navigate} />;
      case 'contact': return <Contact navigate={navigate} />;
      case 'auth': return <Auth navigate={navigate} />;
      case 'profile': return <Profile navigate={navigate} />;
      case 'admin-dashboard': return isAdmin ? <AdminDashboard navigate={navigate} /> : <Home navigate={navigate} />;
      default: return <Home navigate={navigate} />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, isAdmin, isDoctor }}>
      <div className={cn("min-h-screen font-body bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors", isDark && "dark")}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <button onClick={() => navigate('home')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                <HeartPulse size={24} />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-slate-800 dark:text-white">استشارني</span>
            </button>

            <div className="hidden md:flex items-center gap-10">
              <NavButton active={currentPage === 'home'} onClick={() => navigate('home')}>الرئيسية</NavButton>
              <NavButton active={currentPage === 'doctors'} onClick={() => navigate('doctors')}>الأطباء</NavButton>
              <NavButton active={currentPage === 'contact'} onClick={() => navigate('contact')}>تواصل معنا</NavButton>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end mr-4 border-r pr-4 border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Firebase Status</span>
                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> متصل
                </span>
              </div>
              
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                title="تبديل المظهر"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <Notifications />
                  <button
                    onClick={() => navigate(isAdmin ? 'admin-dashboard' : 'profile')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">
                      {(userData?.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-bold hidden sm:inline">{userData?.name || 'مستخدم'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 dark:text-slate-400 hover:text-red-500 border border-transparent hover:border-red-100 transition-colors"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('auth')}
                  className="bg-secondary hover:bg-secondary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95"
                >
                  دخول المسؤول
                </button>
              )}

              <button
                className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
              >
                <div className="px-4 py-6 flex flex-col gap-4">
                  <NavButton active={currentPage === 'home'} onClick={() => navigate('home')}>الرئيسية</NavButton>
                  <NavButton active={currentPage === 'doctors'} onClick={() => navigate('doctors')}>الأطباء</NavButton>
                  <NavButton active={currentPage === 'contact'} onClick={() => navigate('contact')}>تواصل معنا</NavButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="pt-16 pb-12">
          {renderPage()}
        </main>

        <Chat />
        <Footer navigate={navigate} />
      </div>
    </AuthContext.Provider>
  );
}

function NavButton({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-sm font-bold transition-colors relative h-full flex items-center",
        active ? "text-primary border-b-2 border-primary" : "text-slate-600 dark:text-slate-400 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

function Footer({ navigate }: { navigate: (p: string) => void }) {
  return (
    <footer className="bg-slate-900 dark:bg-black text-slate-400 px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between shrink-0 mt-20 border-t border-slate-800">
      <p className="text-xs">© {new Date().getFullYear()} استشارني - جميع الحقوق محفوظة</p>
      <div className="flex gap-6 mt-4 md:mt-0 text-[10px] uppercase font-bold tracking-widest">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Database Live</span>
        <span className="text-slate-500">v2.0.4-Stable</span>
      </div>
    </footer>
  );
}
