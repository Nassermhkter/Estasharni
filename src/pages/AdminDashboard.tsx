import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, DoctorProfile, PlatformSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Stethoscope, 
  Settings, 
  ShieldCheck, 
  XCircle, 
  CheckCircle2, 
  ExternalLink,
  Search,
  MoreVertical,
  Plus,
  UserPlus,
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { notificationService, NotificationType } from '../lib/notifications';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState<'doctors' | 'users' | 'admins' | 'settings'>('doctors');
  const [loading, setLoading] = useState(true);
  
  const [doctors, setDoctors] = useState<(DoctorProfile & { user: User })[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'Estasharni',
    logoUrl: '',
    contactEmail: 'support@estasharni.com',
    contactPhone: '+1 (555) 123-4567',
    maintenanceMode: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs.map(d => d.data() as User);
      setUsers(allUsers.filter(u => u.role === 'client'));
      setAdmins(allUsers.filter(u => u.role === 'admin'));

      // Fetch doctors and link user data
      const doctorsSnap = await getDocs(collection(db, 'doctors'));
      const docData = await Promise.all(
        doctorsSnap.docs.map(async d => {
          const profile = d.data() as DoctorProfile;
          const user = allUsers.find(u => u.uid === profile.userId) || (await getDoc(doc(db, 'users', profile.userId))).data() as User;
          return { ...profile, user };
        })
      );
      setDoctors(docData);

      // Fetch settings
      const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as PlatformSettings);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (doctorId: string) => {
    try {
      await updateDoc(doc(db, 'doctors', doctorId), { approvalStatus: 'approved' });
      await updateDoc(doc(db, 'users', doctorId), { status: 'active' });
      
      // Notify the doctor
      await notificationService.send(
        doctorId,
        'Application Approved!',
        'Your professional profile has been verified. You can now start accepting consultation requests.',
        NotificationType.SUCCESS,
        '/profile'
      );

      toast.success('Doctor approved');
      fetchData();
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (doctorId: string) => {
    const reason = prompt('Reason for rejection:');
    if (reason === null) return;
    try {
      await updateDoc(doc(db, 'doctors', doctorId), { 
        approvalStatus: 'rejected',
        rejectionReason: reason
      });

      // Notify the doctor
      await notificationService.send(
        doctorId,
        'Profile Verification Update',
        `Your application was not approved at this time. Reason: ${reason}`,
        NotificationType.ERROR,
        '/doctor-registration'
      );

      toast.success('Doctor rejected');
      fetchData();
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Nav */}
          <div className="w-full lg:w-72 flex-shrink-0 space-y-3">
            <div className="mb-10 lg:ml-6">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{translate('admin.terminal')}</h2>
              <h1 className="text-3xl font-black dark:text-white mt-1 italic tracking-tight">{translate('admin.admin')} <span className="text-brand">Panel</span></h1>
            </div>

            <Link
              to="/"
              className="w-full flex items-center gap-4 p-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] text-slate-400 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:text-brand hover:border-brand/20 mb-8 mb-10"
            >
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <ArrowLeft className="w-5 h-5 text-brand" />
              </div>
              <span>{translate('admin.back')}</span>
            </Link>

            <TabButton 
              active={activeTab === 'doctors'} 
              onClick={() => setActiveTab('doctors')} 
              icon={<Stethoscope />}
              label="Specialists"
              count={doctors.filter(d => d.approvalStatus === 'pending').length}
            />
            <TabButton 
              active={activeTab === 'users'} 
              onClick={() => setActiveTab('users')} 
              icon={<Users />}
              label="Patient Hub"
            />
            <TabButton 
               active={activeTab === 'admins'} 
               onClick={() => setActiveTab('admins')} 
               icon={<ShieldCheck />}
               label="Access Control"
            />
            <TabButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<Settings />}
              label="Config"
            />
          </div>

          {/* Content Area */}
          <div className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 rounded-sleek-lg p-10 lg:p-14 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 min-h-[700px]"
              >
                <DashboardHeader 
                  title={
                    activeTab === 'doctors' ? 'Professional Roster' :
                    activeTab === 'users' ? 'Global Patients' :
                    activeTab === 'admins' ? 'System Guardians' : 'Global Settings'
                  }
                  desc={
                    activeTab === 'doctors' ? 'Review medical credentials and active practitioner status' :
                    activeTab === 'users' ? 'Overview of all registered individuals on Estasharni' :
                    activeTab === 'admins' ? 'Manage core administrative permissions and logs' : 'Modify platform variables and operational metadata'
                  }
                />

                {loading ? (
                  <div className="flex items-center justify-center py-32"><Loader /></div>
                ) : (
                  <>
                    {activeTab === 'doctors' && (
                      <div className="space-y-6">
                        {doctors.map(doc => (
                          <DoctorRow 
                            key={doc.userId} 
                            doc={doc} 
                            onApprove={() => handleApprove(doc.userId)}
                            onReject={() => handleReject(doc.userId)}
                          />
                        ))}
                      </div>
                    )}

                    {activeTab === 'users' && (
                       <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <th className="pb-6">Identity</th>
                                <th className="pb-6">Reach</th>
                                <th className="pb-6">Arrival</th>
                                <th className="pb-6">State</th>
                                <th className="pb-6 text-right">Ops</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                              {users.map(user => (
                                <tr key={user.uid} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="py-6">
                                    <div className="flex items-center gap-4">
                                      <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0ea5e9&color=fff`} className="w-10 h-10 rounded-xl shadow-md" alt="" />
                                      <span className="font-extrabold dark:text-white tracking-tight">{user.displayName}</span>
                                    </div>
                                  </td>
                                  <td className="py-6 text-slate-500 font-medium text-sm">{user.email}</td>
                                  <td className="py-6 text-slate-500 font-bold text-xs uppercase tracking-tighter">{new Date(user.createdAt).getFullYear()} SESSION</td>
                                  <td className="py-6">
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-green-500/20">Active</span>
                                  </td>
                                  <td className="py-6 text-right">
                                    <button className="p-3 text-slate-300 hover:text-brand hover:bg-brand/5 rounded-xl transition-all"><MoreVertical className="w-5 h-5" /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    )}

                    {activeTab === 'admins' && (
                      <div className="space-y-10">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-6 rounded-sleek border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Staff</p>
                            <p className="text-2xl font-black dark:text-white">{admins.length} Systems</p>
                          </div>
                          <button className="flex items-center gap-3 px-6 py-3 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-all active:scale-95">
                            <UserPlus className="w-4 h-4" />
                            Provision Admin
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {admins.map(admin => (
                             <div key={admin.uid} className="flex items-center justify-between p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow group">
                               <div className="flex items-center gap-4">
                                  <img src={admin.photoURL || `https://ui-avatars.com/api/?name=${admin.displayName}&background=0ea5e9&color=fff`} className="w-14 h-14 rounded-2xl shadow-lg" alt="" />
                                  <div>
                                     <p className="font-extrabold text-lg dark:text-white tracking-tight">{admin.displayName || admin.email}</p>
                                     <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black text-brand uppercase tracking-widest leading-none">Full Authority</p>
                                     </div>
                                  </div>
                               </div>
                               <button className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-xl opacity-0 group-hover:opacity-100"><XCircle className="w-5 h-5" /></button>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                       <div className="max-w-xl space-y-10">
                          <div className="grid grid-cols-1 gap-8">
                            <SettingField 
                              label="Core Platform Name"
                              value={settings.platformName}
                              onChange={(v) => setSettings({...settings, platformName: v})}
                            />
                            <SettingField 
                              label="Support & Billing Email"
                              value={settings.contactEmail}
                              onChange={(v) => setSettings({...settings, contactEmail: v})}
                            />
                            <SettingField 
                              label="Contact Global Line"
                              value={settings.contactPhone}
                              onChange={(v) => setSettings({...settings, contactPhone: v})}
                            />
                          </div>
                          <div className="pt-8 border-t border-slate-50 dark:border-slate-800">
                            <button 
                              onClick={handleSaveSettings}
                              className="px-12 py-5 bg-brand text-white font-black rounded-sleek shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-all text-xl tracking-tight active:scale-95"
                            >
                              Sync Configuration
                            </button>
                          </div>
                       </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, count }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center justify-between p-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]",
      active 
        ? "bg-brand text-white shadow-2xl shadow-brand/30 translate-x-4" 
        : "text-slate-400 bg-white dark:bg-slate-900 border border-white dark:border-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        active ? "bg-white/20" : "bg-slate-50 dark:bg-slate-800"
      )}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <span>{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={cn(
        "px-2.5 py-1 rounded-lg text-[10px] font-black",
        active ? "bg-white text-brand" : "bg-brand text-white shadow-lg shadow-brand/20"
      )}>
        {count}
      </span>
    )}
  </button>
);

const DashboardHeader = ({ title, desc }: any) => (
  <div className="mb-14 text-center lg:text-left">
    <h1 className="text-5xl font-black dark:text-white mb-4 italic tracking-tight">{title}</h1>
    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">{desc}</p>
  </div>
);

const DoctorRow = ({ doc, onApprove, onReject }: any) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-sleek gap-10 hover:bg-white dark:hover:bg-slate-900 transition-all hover:shadow-2xl group">
    <div className="flex items-center gap-6">
      <img src={doc.user.photoURL || `https://ui-avatars.com/api/?name=${doc.user.displayName}&background=0ea5e9&color=fff`} className="w-20 h-20 rounded-2xl shadow-lg group-hover:scale-105 transition-transform" alt="" />
      <div>
        <h4 className="text-2xl font-black dark:text-white tracking-tight italic">Dr. {doc.user.displayName}</h4>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-brand font-black text-xs uppercase tracking-widest">{doc.specialty}</p>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <p className="text-slate-400 text-xs font-bold">{doc.user.email}</p>
        </div>
      </div>
    </div>
    
    <div className="flex flex-wrap items-center gap-6">
      {doc.approvalStatus === 'pending' ? (
        <div className="flex items-center gap-3">
          <button 
            onClick={onApprove}
            className="px-6 py-3 bg-green-500 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 hover:bg-green-600 shadow-xl shadow-green-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" /> Finalize Approval
          </button>
          <button 
            onClick={onReject}
            className="px-6 py-3 bg-white dark:bg-slate-900 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl border border-red-500/20 hover:bg-red-50 flex items-center gap-2 transition-all active:scale-95"
          >
            <XCircle className="w-4 h-4" /> Reject Entry
          </button>
        </div>
      ) : (
        <span className={cn(
          "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
          doc.approvalStatus === 'approved' ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
        )}>
          Status: {doc.approvalStatus}
        </span>
      )}
      
      {doc.certificates?.length > 0 && (
         <div className="flex -space-x-3">
            {doc.certificates.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-2xl border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900 text-brand shadow-lg hover:z-10 transition-transform hover:-translate-y-2 group/icon">
                 <ExternalLink className="w-5 h-5 group-hover/icon:scale-110 transition-transform" />
              </a>
            ))}
         </div>
      )}
    </div>
  </div>
);

const SettingField = ({ label, value, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
    <input 
      type="text" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-bold tracking-tight text-lg shadow-inner"
    />
  </div>
);

const Loader = () => (
  <div className="flex flex-col items-center gap-6 text-brand font-black italic">
    <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin shadow-2xl shadow-brand/20"></div>
    <span className="uppercase tracking-[0.2em] text-[10px]">Synchronizing Terminal...</span>
  </div>
);

export default AdminDashboard;
