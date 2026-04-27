import React from 'react';
import { motion } from 'motion/react';
import { HeartPulse, ShieldPlus, Search, CalendarCheck, Video, ChevronLeft, Star, BriefcaseMedical, Award } from 'lucide-react';
import { SPECIALTIES } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HomeProps {
  navigate: (p: string) => void;
}

export default function Home({ navigate }: HomeProps) {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-right rtl"
          >
            <div className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              مستقبلك الصحي يبدأ هنا
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 dark:text-white leading-[1.1] mb-6">
              استشارتك الطبية <br/>
              <span className="text-primary">بلمسة واحدة</span>
            </h1>

            <p className="text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-xl ml-auto">
              تواصل مع أطباء معتمدين من منزلك بكل خصوصية وأمان. احصل على استشارات متخصصة وخطط علاجية مخصصة ورعاية مستمرة عبر منصة مشفرة بالكامل.
            </p>

            <div className="flex flex-wrap gap-4 justify-end">
              <button
                onClick={() => navigate('doctors')}
                className="px-8 py-4 bg-primary text-white rounded-xl text-lg font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:scale-105 transition-transform"
              >
                احجز موعدك الآن
              </button>
              <button
                onClick={() => navigate('contact')}
                className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                تحدث مع الدعم
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">+150</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">طبيب متخصص</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">24/7</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">دعم فني مباشر</div>
              </div>
              <div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">100%</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">خصوصية البيانات</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex justify-end p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border border-slate-200 dark:border-slate-800"
          >
            <div className="relative">
              <div className="w-80 h-80 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl animate-pulse absolute -z-10" />
              <HeartPulse size={240} className="text-primary opacity-10 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-2xl text-white">
                   <HeartPulse size={24} />
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-100/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-black mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-slate-500 max-w-md mx-auto">ثلاث خطوات بسيطة للحصول على الرعاية الطبية التي تستحقها</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <WorkStep
              icon={<Search size={32} />}
              title="ابحث عن طبيب"
              description="تصفح شبكتنا الواسعة من الأطباء المتخصصين والمعتمدين حسب تخصصك."
            />
            <WorkStep
              icon={<CalendarCheck size={32} />}
              title="احجز استشارة"
              description="اختر الموعد الذي يناسب جدولك وأرسل طلب استشارتك بكل سهولة."
            />
            <WorkStep
              icon={<Video size={32} />}
              title="احصل على الرعاية"
              description="تواصل مع طبيبك عبر مكالمة فيديو آمنة أو محادثة فورية للحصول على التشخيص."
            />
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-display font-black mb-4">التخصصات الطبية</h2>
            <p className="text-slate-500">نحن نغطي مجموعة واسعة من الاحتياجات الصحية المتخصصة</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SPECIALTIES.map((s) => (
              <motion.button
                key={s.name}
                whileHover={{ y: -5 }}
                onClick={() => navigate('doctors')}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-4 hover:shadow-xl hover:shadow-sky-500/5 transition-all text-right group"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${s.color}15`, color: s.color }}
                >
                  <HeartPulse size={24} />
                </div>
                <span className="font-bold text-sm">{s.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-display font-black text-sky-500">{value}</div>
      <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function FloatingCard({ icon, title, subtitle, className }: { icon: React.ReactNode; title: string, subtitle: string, className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      className={cn("absolute bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 z-20 min-w-[160px]", className)}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        {icon}
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{title}</div>
        <div className="text-[10px] text-slate-400">{subtitle}</div>
      </div>
    </motion.div>
  );
}

function WorkStep({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all group text-right">
      <div className="w-20 h-20 bg-sky-500 rounded-3xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-display font-black mb-3">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
