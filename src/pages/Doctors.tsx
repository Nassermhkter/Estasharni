import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { DoctorData, SPECIALTIES } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, BriefcaseMedical, Award, Filter, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DoctorsProps {
  navigate: (p: string) => void;
}

export default function Doctors({ navigate }: DoctorsProps) {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'doctors'), where('status', '==', 'approved'));
        const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, 'doctors'));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as DoctorData));
        
        if (docs.length === 0) {
          // Fallback to demo data if empty
          setDoctors([
            { id: '1', name: 'د. سارة Mitchell', specialty: 'أمراض القلب', experience: '12 سنة', qualifications: 'زمالة أمراض القلب', bio: 'خبيرة في تشخيص وعلاج أمراض القلب والأوعية الدموية مع خبرة سريرية واسعة.', status: 'approved', rating: 4.9, createdAt: '' },
            { id: '2', name: 'د. جيمس Chen', specialty: 'الأعصاب', experience: '15 سنة', qualifications: 'دكتوراه في جراحة الأعصاب', bio: 'متخصص في علاج الحالات العصبية المعقدة واضطرابات الدماغ.', status: 'approved', rating: 4.8, createdAt: '' },
            { id: '3', name: 'د. أميرة حسن', specialty: 'الجلدية', experience: '8 سنوات', qualifications: 'ماجستير الأمراض الجلدية', bio: 'متخصصة في العلاجات الجلدية المتقدمة والتجميل الطبي.', status: 'approved', rating: 4.7, createdAt: '' },
            { id: '4', name: 'د. مايكل رامي', specialty: 'العظام', experience: '20 سنة', qualifications: 'زمالة جراحة العظام', bio: 'خبير في جراحات المفاصل وإصابات الملاعب والكسور المعقدة.', status: 'approved', rating: 4.9, createdAt: '' },
          ]);
        } else {
          setDoctors(docs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesFilter = filter === 'all' || doctor.specialty === filter;
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-black mb-4">نخبة الأطباء المتخصصين</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">تواصل مع أفضل الكوادر الطبية المعتمدة في مختلف التخصصات للحصول على رعاية صحية متميزة.</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-8 mb-12">
        <div className="relative max-w-2xl mx-auto w-full">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 pr-14 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right shadow-sm"
            placeholder="ابحث عن طبيب بالاسم أو التخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar justify-center">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>الكل</FilterButton>
          {SPECIALTIES.map(s => (
            <FilterButton key={s.name} active={filter === s.name} onClick={() => setFilter(s.name)}>
              {s.name}
            </FilterButton>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 h-80 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />
          ))
        ) : filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] flex flex-col hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary font-black text-2xl overflow-hidden shrink-0 border border-blue-100 dark:border-blue-800/50">
                  {doctor.photo ? <img src={doctor.photo} className="w-full h-full object-cover" /> : doctor.name.charAt(0)}
                </div>
                <div className="text-right">
                  <h3 className="font-display font-black text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{doctor.name}</h3>
                  <div className="text-primary text-[10px] font-black uppercase tracking-widest">{doctor.specialty}</div>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{doctor.rating}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 text-right leading-relaxed">
                {doctor.bio}
              </p>

              <div className="flex flex-wrap gap-2 justify-end mb-6 mt-auto">
                <Badge icon={<BriefcaseMedical size={12} />}>{doctor.experience}</Badge>
                <Badge icon={<Award size={12} />}>{doctor.qualifications}</Badge>
              </div>

              <button
                onClick={() => navigate('auth')}
                className="w-full bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-primary transition-all shadow-md active:scale-95 text-sm"
              >
                طلب استشارة
              </button>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-display font-bold text-slate-400">لا يوجد أطباء مطابقون لبحثك</h3>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void; key?: React.Key }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap active:scale-95 uppercase tracking-widest border",
        active 
          ? "bg-primary text-white border-primary shadow-lg shadow-blue-100 dark:shadow-none" 
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold border border-slate-200/50 dark:border-slate-700/50">
      {icon}
      {children}
    </div>
  );
}
