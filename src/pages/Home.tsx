import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Activity, Shield, Users, Clock, ArrowRight, Star, HeartPulse, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

const Home = () => {
  const { translate } = useLanguage();
  const features = [
    {
      icon: <Stethoscope className="w-6 h-6 text-brand" />,
      title: "أطباء مختصون",
      description: "تواصل مع أطباء معتمدين في مختلف التخصصات الطبية."
    },
    {
      icon: <Clock className="w-6 h-6 text-brand" />,
      title: "متاح 24/7",
      description: "احصل على استشارتك الطبية في أي وقت، ليلاً أو نهاراً."
    },
    {
      icon: <Shield className="w-6 h-6 text-brand" />,
      title: "خصوصية وأمان",
      description: "بياناتك الصحية مشفرة ومحمية بأعلى المعايير العالمية."
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-52 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand/10 to-transparent dark:from-brand/5 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: language === 'ar' ? 30 : -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 dark:bg-brand/20 text-brand text-xs font-bold uppercase tracking-widest mb-8 border border-brand/20">
                <Activity className="w-4 h-4" />
                <span>منصة الرعاية الطبية الحديثة</span>
              </div>
              <h1 className="text-5xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-10 leading-[1] italic">
                {translate('hero.title')} <br />
                <span className="text-brand not-italic">{translate('hero.title.span')}</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-lg leading-relaxed font-medium">
                {translate('hero.desc')}
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Link
                  to="/doctors"
                  className="w-full sm:w-auto px-10 py-5 bg-brand hover:bg-brand-hover text-white font-black rounded-sleek shadow-2xl shadow-brand/30 flex items-center justify-center gap-3 group transition-all hover:-translate-y-1"
                >
                  {translate('hero.cta.start')}
                  <ArrowRight className={cn("w-6 h-6 group-hover:translate-x-2 transition-transform", language === 'ar' && "rotate-180")} />
                </Link>
                <Link
                  to="/auth"
                  className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white font-black rounded-sleek hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  {translate('hero.cta.browse')}
                </Link>
              </div>
              
              <div className="mt-12 flex items-center space-x-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">Trusted by <span className="font-bold text-slate-900 dark:text-white">10k+ patients</span></p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 rounded-sleek-lg overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800">
                 <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1000&auto=format&fit=crop" 
                  alt="Doctor" 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-6 rounded-sleek shadow-2xl border border-white/20 dark:border-slate-700/20 flex items-center gap-4"
              >
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <HeartPulse className="w-7 h-7 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Status</p>
                  <p className="font-extrabold text-lg dark:text-white">Doctor Online</p>
                </div>
              </motion.div>

              <motion.div 
                 animate={{ y: [0, 15, 0] }}
                 transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-10 -left-10 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-8 rounded-sleek shadow-2xl border border-white/20 dark:border-slate-700/20"
              >
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-brand" />
                  </div>
                  <p className="font-extrabold text-lg dark:text-white">12 New Sessions</p>
                </div>
                <div className="h-3 w-48 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-brand shadow-lg shadow-brand/50"></div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-32 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl lg:text-5xl font-black mb-6 dark:text-white tracking-tight">Why Choose <span className="text-brand italic">Estasharni?</span></h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              We've built a platform that removes the barriers between patients and quality care through innovation and empathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="p-10 rounded-sleek border border-slate-100 dark:border-slate-800 bg-surface-bg dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-2xl group"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 dark:text-white tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-loose">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-brand overflow-hidden relative">
        <motion.div 
           animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
           transition={{ duration: 30, repeat: Infinity }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-hover rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tight">هل أنت مستعد لاستشارة أخصائي؟</h2>
          <p className="text-white/80 text-xl mb-12 max-w-2xl leading-relaxed">
            أنشئ حساباً في دقائق وابدأ رحلتك الصحية اليوم. أطباؤنا العالميون بانتظارك لتقديم الرعاية التي تستحقها.
          </p>
          <Link
            to="/auth"
            className="px-12 py-5 bg-white text-brand font-black rounded-sleek hover:bg-slate-50 transition-all shadow-2xl hover:scale-105 active:scale-95"
          >
            ابدأ الآن
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <HeartPulse className="w-8 h-8 text-brand" />
                <span className="text-2xl font-black dark:text-white tracking-tighter italic">ESTASHARNI <span className="text-brand">استشارني</span></span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{translate('footer.copy')}</p>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-left">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-black tracking-widest text-xs uppercase">
                <Activity className="w-4 h-4 text-brand" />
                <span>المقر الرئيسي: {translate('footer.location')}</span>
              </div>
              <p className="text-xs text-slate-500">{translate('footer.address')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
