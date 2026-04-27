import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { motion } from 'motion/react';
import { Chrome, Facebook, Mail, Phone, ShieldCheck, HeartPulse, ArrowLeft, Key } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const Auth = () => {
  const { loginWithGoogle, loginWithFacebook, loginWithEmail, registerWithEmail, user } = useAuth();
  const { translate } = useLanguage();
  const [role, setRole] = useState<UserRole>('client');
  const [mode, setMode] = useState<'social' | 'email-login' | 'email-register'>('social');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      if (provider === 'google') await loginWithGoogle(role);
      else await loginWithFacebook(role);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'email-login') {
      await loginWithEmail(email, password);
    } else {
      await registerWithEmail(email, password, name, role);
    }
  };

  return (
    <div className="min-h-screen flex bg-surface-bg dark:bg-slate-950">
      {/* Left Side: Illustration & Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand items-center justify-center p-16 text-white relative overflow-hidden">
        <motion.div 
           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
           transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" 
        />
        <div className="max-w-md relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12 font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" />
            {translate('auth.back')}
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-sleek inline-block shadow-2xl"
          >
            <HeartPulse className="w-12 h-12" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl font-black mb-8 leading-[0.9] italic"
          >
            Your Health, <br />
            Our Priority.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-xl font-medium leading-relaxed"
          >
            Join Estasharni today and get access to thousands of world-class medical experts from the comfort of your digital home.
          </motion.p>
        </div>
      </div>

      {/* Right Side: Auth UI */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-900 shadow-2xl lg:shadow-none relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]">
            <ArrowLeft className="w-4 h-4" />
            {translate('auth.back')}
          </Link>
        </div>
        
        <div className="w-full max-w-sm space-y-10">
          {mode === 'social' ? (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{translate('auth.welcome')}</h2>
                <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium tracking-tight">{translate('auth.choose_identity')}</p>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => setRole('client')}
                  className={cn(
                    "py-6 rounded-sleek border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                    role === 'client' 
                      ? "border-brand bg-brand/5 text-brand shadow-xl shadow-brand/10" 
                      : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    role === 'client' ? "bg-brand text-white" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100"
                  )}>
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">{translate('auth.patient')}</span>
                </button>
                <button
                  onClick={() => setRole('doctor')}
                  className={cn(
                    "py-6 rounded-sleek border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group",
                    role === 'doctor' 
                      ? "border-brand bg-brand/5 text-brand shadow-xl shadow-brand/10" 
                      : "border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    role === 'doctor' ? "bg-brand text-white" : "bg-slate-50 dark:bg-slate-800 group-hover:bg-slate-100"
                  )}>
                     <HeartPulse className="w-6 h-6" />
                  </div>
                  <span className="font-black text-sm uppercase tracking-widest">{translate('auth.doctor')}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Social Buttons */}
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="w-full flex items-center justify-center gap-4 px-6 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-sleek font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                >
                  <Chrome className="w-5 h-5 text-brand" />
                  {translate('auth.continue_google')}
                </button>
                
                <button
                  onClick={() => handleSocialLogin('facebook')}
                  className="w-full flex items-center justify-center gap-4 px-6 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-sleek font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  {translate('auth.continue_facebook')}
                </button>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]"><span className="px-3 bg-white dark:bg-slate-900 text-slate-400">{translate('auth.or_continue')}</span></div>
                </div>

                <button
                  onClick={() => setMode('email-login')}
                  className="w-full flex items-center justify-center gap-4 px-6 py-4 border-2 border-slate-100 dark:border-slate-800 rounded-sleek font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all shadow-sm active:scale-95"
                >
                  <Key className="w-5 h-5" />
                  {translate('auth.email_pass')}
                </button>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <button 
                onClick={() => setMode('social')}
                className="flex items-center gap-2 text-slate-400 hover:text-brand transition-colors font-bold uppercase tracking-widest text-[10px]"
              >
                <ArrowLeft className="w-4 h-4" />
                {translate('auth.back')}
              </button>

              <div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {mode === 'email-login' ? translate('auth.welcome') : translate('auth.register_title')}
                </h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                  {mode === 'email-login' ? translate('auth.choose_identity') : translate('auth.register_title')}
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                {mode === 'email-register' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{translate('auth.full_name')}</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-brand outline-none transition-all dark:text-white font-bold"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{translate('auth.email')}</label>
                  <input 
                    type="email" 
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-brand outline-none transition-all dark:text-white font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{translate('auth.password')}</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-xl focus:border-brand outline-none transition-all dark:text-white font-bold"
                  />
                </div>

                <div className="pt-4">
                  <button className="w-full py-5 bg-brand hover:bg-brand-hover text-white font-black rounded-sleek shadow-2xl shadow-brand/30 transition-all active:scale-95 uppercase tracking-widest text-xs">
                    {mode === 'email-login' ? translate('auth.login_title') : translate('auth.register_title')}
                  </button>
                </div>
              </form>

              <div className="text-center">
                <button 
                  onClick={() => setMode(mode === 'email-login' ? 'email-register' : 'email-login')}
                  className="text-xs font-black text-brand uppercase tracking-widest hover:underline"
                >
                  {mode === 'email-login' ? translate('auth.need_account') : translate('auth.have_account')}
                </button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest px-8">
            By clicking continue, you agree to our <a href="#" className="text-brand hover:underline">Terms</a> and <a href="#" className="text-brand hover:underline">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
