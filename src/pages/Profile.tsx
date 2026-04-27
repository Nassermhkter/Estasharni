import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { UserData, ConsultationData, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { User, Phone, Mail, Save, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  navigate: (p: string) => void;
}

export default function Profile({ navigate }: ProfileProps) {
  const { user, userData } = useAuth();
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setPhone(userData.phone || '');
    }

    const fetchConsultations = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'consultations'),
          where(userData?.role === UserRole.DOCTOR ? 'doctorId' : 'patientId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q).catch(e => handleFirestoreError(e, OperationType.LIST, 'consultations'));
        setConsultations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConsultationData)));
      } catch (err) {
        console.error(err);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchConsultations();
  }, [user, userData]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, phone });
      alert('تم تحديث البيانات بنجاح');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Profile Card */}
        <div className="md:w-80 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 text-center sticky top-24 shadow-sm">
            <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white text-3xl font-black mx-auto mb-6 shadow-xl shadow-blue-100 dark:shadow-none">
              {name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-display font-black mb-1">{name}</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-6">{userData?.email}</p>
            
            <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
              userData?.role === UserRole.DOCTOR ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              {userData?.role === UserRole.DOCTOR ? 'MEDICAL PROFESSIONAL' : 'VERIFIED PATIENT'}
            </span>

            <div className="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
               <form onSubmit={handleUpdate} className="text-right">
                  <div className="mb-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">الإسم الكامل</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 mr-1">رقم التواصل</label>
                    <input
                      type="tel"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <button
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all shadow-md active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    تحديث الملف الشخصي
                  </button>
               </form>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 min-h-[400px]">
            <h3 className="text-xl font-display font-black mb-8 rtl">سجل الاستشارات</h3>
            
            {fetchLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : consultations.length > 0 ? (
              <div className="space-y-4">
                {consultations.map(c => (
                  <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        c.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' :
                        c.status === 'pending' ? 'bg-amber-50 text-amber-500 border border-amber-100' : 'bg-red-50 text-red-500 border border-red-100'
                      }`}>
                        {c.status === 'approved' ? <CheckCircle2 size={20} /> : 
                         c.status === 'pending' ? <Clock size={20} /> : <XCircle size={20} />}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800 dark:text-white">
                          {userData?.role === UserRole.DOCTOR ? c.patientName : c.doctorName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          {c.date} • {c.time}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        c.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                        c.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-red-50 text-red-500 border-red-100'
                      }`}>
                        {c.status === 'approved' ? 'APPROVED' : c.status === 'pending' ? 'WAITING' : 'CANCELLED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                <AlertCircle size={64} className="mx-auto mb-6 opacity-10" />
                <p className="text-xs font-black uppercase tracking-widest">لا يوجد طلبات استشارة مسجلة</p>
                <button 
                  onClick={() => navigate('doctors')}
                  className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                >
                  تصفح قائمة الأطباء
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
