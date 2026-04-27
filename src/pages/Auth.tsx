import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, addDoc, collection } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, Mail, Lock, User as UserIcon, ArrowRight, Loader2, ShieldCheck, Stethoscope, UserCircle } from 'lucide-react';
import { UserRole } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthProps {
  navigate: (p: string) => void;
}

export default function Auth({ navigate }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Security check for admin role
    if (role === UserRole.ADMIN && adminSecret !== '123456') {
      setError('رمز المسؤول غير صحيح. يرجى إدخال الرمز الصحيح (1-6)');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        
        // Save user data to Firestore
        const userData = {
          uid: cred.user.uid,
          name,
          email,
          role,
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', cred.user.uid), userData);

        // Send welcome notification
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: cred.user.uid,
            title: 'مرحباً بك في استشارني!',
            message: 'نحن سعداء بانضمامك إلينا. يمكنك الآن حجز المواعيد والتواصل مع الأطباء.',
            read: false,
            type: 'success',
            createdAt: new Date().toISOString()
          });
        } catch (notifErr) {
          console.error('Failed to send welcome notification:', notifErr);
        }

        // If user is admin (verified by secret earlier), add to admins collection
        const isAdminEmail = ['hadirynasser@gmail.com', 'hadirynaser@gmail.com'].includes(email.toLowerCase());
        if (role === UserRole.ADMIN || isAdminEmail) {
          await setDoc(doc(db, 'admins', cred.user.uid), { 
            email, 
            level: isAdminEmail ? 'Super' : 'Standard', 
            createdAt: new Date().toISOString() 
          });
          if (isAdminEmail && role !== UserRole.ADMIN) {
            await setDoc(doc(db, 'users', cred.user.uid), { role: UserRole.ADMIN }, { merge: true });
          }
        }

        if (role === UserRole.DOCTOR) {
          // Additional doctor setup could go here
          await setDoc(doc(db, 'doctors', cred.user.uid), {
            userId: cred.user.uid,
            name,
            email,
            status: 'pending',
            rating: 0,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('home');
    } catch (err: any) {
      console.error('Full Auth Error Object:', JSON.stringify(err));
      console.error('Auth Error Code:', err.code);
      console.error('Auth Error Message:', err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى "تسجيل الدخول" بدلاً من إنشاء حساب جديد.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('بيانات الاعتماد غير صالحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور، أو "إنشاء حساب" إذا كنت مستخدماً جديداً.');
      } else if (err.code === 'auth/user-not-found') {
        setError('لا يوجد حساب مسجل بهذا البريد الإلكتروني. يرجى إنشاء حساب أولاً.');
      } else if (err.code === 'auth/wrong-password') {
        setError('كلمة المرور التي أدخلتها غير صحيحة.');
      } else if (err.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني المدخل غير صحيح فنياً.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً. يجب أن تكون 6 خانات على الأقل.');
      } else {
        setError('حدث خطأ أثناء محاولة الدخول. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          name: cred.user.displayName || 'مستخدم',
          email: cred.user.email,
          role: UserRole.PATIENT,
          createdAt: new Date().toISOString(),
        });
      }
      navigate('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 py-20 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-sky-500/20">
            <HeartPulse className="text-white w-9 h-9" />
          </div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            {isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}
          </h1>
          <p className="text-slate-500 mt-2">
            {isSignUp ? 'ابدأ رحلتك الصحية معنا اليوم' : 'سجل دخولك لمتابعة استشاراتك'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[2.5rem] shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold animate-shake text-right">
              {error}
            </div>
          )}

          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8">
            <RoleSwitchButton active={role === UserRole.PATIENT} onClick={() => setRole(UserRole.PATIENT)} icon={<UserIcon size={16} />}>مريض</RoleSwitchButton>
            <RoleSwitchButton active={role === UserRole.DOCTOR} onClick={() => setRole(UserRole.DOCTOR)} icon={<Stethoscope size={16} />}>طبيب</RoleSwitchButton>
            <RoleSwitchButton active={role === UserRole.ADMIN} onClick={() => setRole(UserRole.ADMIN)} icon={<ShieldCheck size={16} />}>مشرف</RoleSwitchButton>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide mr-1 text-right">الاسم الكامل</label>
                <div className="relative">
                  <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide mr-1 text-right">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                  placeholder="admin@estasharni.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide mr-1 text-right">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                  placeholder="********"
                />
              </div>
            </div>

            {role === UserRole.ADMIN && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide mr-1 text-right">رمز الوصول للمسؤول (1-6)</label>
                <div className="relative">
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={adminSecret}
                    onChange={(e) => setAdminSecret(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 pr-12 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                    placeholder="أدخل رمز المسؤول"
                  />
                </div>
              </motion.div>
            )}

            <button
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>{isSignUp ? 'إنشاء حساب جديد' : 'دخول النظام'}</span>
                  <ArrowRight size={18} className="rotate-180" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 text-slate-300 text-[10px] font-bold tracking-widest uppercase">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span>أو المواصلة بـ</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-slate-200 dark:border-slate-800 py-3.5 rounded-lg flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-xs text-slate-600 dark:text-slate-300 active:scale-95 mb-6"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            تسجيل الدخول عبر جوجل
          </button>

          <p className="text-center text-xs text-slate-400 font-medium">
            {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary font-bold hover:underline mx-1"
            >
              {isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </button>
          </p>
          
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium leading-relaxed">
              PROTECTED BY FIREBASE AUTHENTICATION<br/>
              SECURE CLOUD DATA STORAGE
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RoleSwitchButton({ children, active, onClick, icon }: { children: React.ReactNode; active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all",
        active ? "bg-white dark:bg-slate-700 text-sky-500 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      )}
    >
      {icon}
      {children}
    </button>
  );
}
