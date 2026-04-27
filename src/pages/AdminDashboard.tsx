import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { UserData, DoctorData, ConsultationData, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import { 
  Users, UserCircle, Stethoscope, Inbox, MessageSquare, ShieldCheck, 
  Settings, LayoutDashboard, Check, X, Trash, Edit, Plus, ExternalLink,
  Loader2, TrendingUp, Calendar, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  navigate: (p: string) => void;
}

export default function AdminDashboard({ navigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, doctors: 0, consultations: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [uSnap, dSnap, cSnap, mSnap] = await Promise.all([
          getDocs(collection(db, 'users')).catch(e => handleFirestoreError(e, OperationType.LIST, 'users')),
          getDocs(collection(db, 'doctors')).catch(e => handleFirestoreError(e, OperationType.LIST, 'doctors')),
          getDocs(collection(db, 'consultations')).catch(e => handleFirestoreError(e, OperationType.LIST, 'consultations')),
          getDocs(collection(db, 'messages')).catch(e => handleFirestoreError(e, OperationType.LIST, 'messages'))
        ]);
        setStats({
          users: uSnap.size,
          doctors: dSnap.size,
          consultations: cSnap.size,
          messages: mSnap.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const tabs = [
    { id: 'overview', name: 'نظرة عامة', icon: <LayoutDashboard size={18} /> },
    { id: 'doctors', name: 'الأطباء', icon: <Stethoscope size={18} /> },
    { id: 'users', name: 'المستخدمون', icon: <Users size={18} /> },
    { id: 'consultations', name: 'الاستشارات', icon: <Inbox size={18} /> },
    { id: 'messages', name: 'الرسائل', icon: <MessageSquare size={18} /> },
    { id: 'admins', name: 'المشرفون', icon: <ShieldCheck size={18} /> },
    { id: 'settings', name: 'الإعدادات', icon: <Settings size={18} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-4 sticky top-24">
            <div className="flex flex-col gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-white shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="rtl">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-40">
              <Loader2 className="animate-spin text-sky-500" size={32} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'overview' && <OverviewTab stats={stats} />}
                {activeTab === 'doctors' && <DoctorsTab />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'messages' && <MessagesTab />}
                {activeTab === 'admins' && <AdminsTab />}
                {activeTab === 'settings' && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="المستخدمين" value={stats.users} icon={<Users />} color="bg-blue-500" />
        <StatCard title="الأطباء" value={stats.doctors} icon={<Stethoscope />} color="bg-emerald-500" />
        <StatCard title="الاستشارات" value={stats.consultations} icon={<Inbox />} color="bg-sky-500" />
        <StatCard title="الرسائل" value={stats.messages} icon={<MessageSquare />} color="bg-purple-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem]">
          <h3 className="text-xl font-display font-black mb-6 flex items-center justify-between">
            <span className="rtl">آخر النشاطات</span>
            <ArrowUpRight size={20} className="text-slate-400" />
          </h3>
          <div className="space-y-4">
            {/* Mock recent activity for now */}
            <ActivityItem title="انضمام مستخدم جديد" time="منذ 5 دقائق" />
            <ActivityItem title="طلب استشارة جديد" time="منذ 12 دقيقة" />
            <ActivityItem title="رسالة جديدة من الدعم" time="منذ ساعة" />
          </div>
        </div>

        <div className="bg-sky-500 rounded-[2.5rem] p-8 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-display font-black mb-2">أداء المنصة</h3>
            <p className="text-sky-100 text-sm">نمو مستقر بنسبة 15% هذا الشهر مقارنة بالشهر السابق.</p>
          </div>
          <div className="mt-8">
             <div className="text-4xl font-display font-black">+1,240</div>
             <div className="text-xs text-sky-200 uppercase font-bold tracking-widest mt-1">زيارة اليوم</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
      <div className="text-right">
        <div className="text-2xl font-display font-black text-slate-800 dark:text-white">{value}</div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{title}</div>
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
    </div>
  );
}

function MessagesTab() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="bg-slate-800 p-4 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-between px-8">
        <span className="rtl">مركز المراسلات</span>
        <MessageSquare size={16} />
      </div>
      <div className="p-16 text-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
          <Inbox size={40} />
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">صندوق الوارد فارغ</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">لم يتم العثور على أي رسائل جديدة من المستخدمين في الوقت الحالي.</p>
      </div>
    </div>
  );
}

function AdminsTab() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="bg-slate-800 p-4 text-white font-bold text-xs tracking-widest uppercase px-8 text-right">
        إدارة الفريق الإداري
      </div>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:scale-105 transition-transform active:scale-95 shadow-md shadow-blue-100">
            + إضافة مسؤول جديد
          </button>
          <div className="text-right">
            <h4 className="font-black text-slate-800 dark:text-white">المسؤولون النشطون</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">فريق الإدارة الحالي</p>
          </div>
        </div>
        
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase font-black tracking-widest">
              <th className="pb-4 pr-4">الاسم</th>
              <th className="pb-4">الدور</th>
              <th className="pb-4 text-left pl-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr className="group">
              <td className="py-5 pr-4 border-b border-slate-50 dark:border-slate-800/50">
                <div className="text-sm font-bold text-slate-800 dark:text-white">Admin System</div>
                <div className="text-[10px] text-slate-400">master-admin@estasharni.com</div>
              </td>
              <td className="py-5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-black tracking-widest border border-blue-200 uppercase">Super User</span>
              </td>
              <td className="py-5 pl-4 border-b border-slate-50 dark:border-slate-800/50 text-left">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1.5">
                   ONLINE <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="bg-slate-800 p-4 text-white font-bold text-xs tracking-widest uppercase px-8 text-right">
        إعدادات المنصة المتقدمة
      </div>
      <div className="p-8 space-y-10">
        <section className="max-w-2xl ml-auto border-r-4 border-primary pr-6">
          <h4 className="font-black text-lg text-slate-800 dark:text-white mb-2 text-right">تفضيلات المعالجة</h4>
          <p className="text-xs text-slate-400 mb-6 text-right">تحكم في الطريقة التي تتعامل بها المنصة مع الطلبات الجديدة والبيانات</p>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
               </div>
               <div className="text-right">
                 <span className="block text-sm font-bold">التسجيل المفتوح</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Open Registration</span>
               </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                 <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
               </div>
               <div className="text-right">
                 <span className="block text-sm font-bold">وضع الصيانة</span>
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Maintenance Mode</span>
               </div>
             </div>
          </div>
        </section>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-right">
          <button className="bg-slate-900 hover:bg-black text-white px-10 py-3.5 rounded-xl font-bold text-sm shadow-xl active:scale-95 transition-all">تحديث كافة الإعدادات</button>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ title, time }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm font-bold">{title}</span>
      <span className="text-xs text-slate-400">{time}</span>
    </div>
  );
}

function DoctorsTab() {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'doctors'), (snap) => {
      setDoctors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoctorData)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'doctors');
    });
    return () => unsubscribe();
  }, []);

  const handleStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'doctors', id), { status });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-display font-black">إدارة الأطباء</h3>
        <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary-hover transition-colors flex items-center gap-2">
          <Plus size={16} /> إضافة طبيب
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الطبيب</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">التخصص</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {doctors.map(doctor => (
              <tr key={doctor.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/30 flex items-center justify-center text-sky-500 font-bold overflow-hidden">
                      {doctor.photo ? <img src={doctor.photo} className="w-full h-full object-cover" /> : doctor.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{doctor.name}</div>
                      <div className="text-xs text-slate-400">{doctor.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">{doctor.specialty}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    doctor.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                    doctor.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {doctor.status === 'approved' ? 'مقبول' : doctor.status === 'pending' ? 'بانتظار المراجعة' : 'مرفوض'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {doctor.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatus(doctor.id, 'approved')} className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors"><Check size={16} /></button>
                        <button onClick={() => handleStatus(doctor.id, 'rejected')} className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"><X size={16} /></button>
                      </>
                    )}
                    <button className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors"><Edit size={16} /></button>
                    <button onClick={() => deleteDoc(doc(db, 'doctors', doctor.id))} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><Trash size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(doc => doc.data() as UserData));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-display font-black">إدارة المستخدمين</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">المستخدم</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الدور</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">تاريخ الانضمام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    u.role === UserRole.ADMIN ? 'bg-red-100 text-red-600' :
                    u.role === UserRole.DOCTOR ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {u.role === UserRole.ADMIN ? 'مشرف' : u.role === UserRole.DOCTOR ? 'طبيب' : 'مريض'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-2" />
                  <span className="text-xs font-bold text-emerald-500">نشط</span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
