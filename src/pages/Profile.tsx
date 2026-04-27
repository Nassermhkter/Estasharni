import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Consultation, Notification, Message, User } from '../types';
import { notificationService, NotificationType } from '../lib/notifications';
import { useNotifications } from '../lib/useNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  ChevronRight,
  Settings,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userData, user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<'info' | 'consultations' | 'messages' | 'notifications'>('consultations');
  
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Sound play blocked by browser"));
  };

  // Play sound on notification count increase
  const prevUnreadCount = React.useRef(unreadCount);
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      playNotificationSound();
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!user) return;

    // Listen for consultations
    const qCons = query(
      collection(db, 'consultations'),
      where(userData?.role === 'doctor' ? 'doctorId' : 'clientId', '==', user.uid),
      orderBy('requestDate', 'desc')
    );

    const unsubCons = onSnapshot(qCons, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Consultation));
      setConsultations(data);
      setLoading(false);
    });

    return () => {
      unsubCons();
    };
  }, [user, userData]);

  const markNotifRead = async (id: string) => {
    await notificationService.markAsRead(id);
  };

  const handleConsultationAction = async (con: Consultation, status: 'scheduled' | 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'consultations', con.id!), { status });
      
      const targetUser = userData?.role === 'doctor' ? con.clientId : con.doctorId;
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      
      await notificationService.send(
        targetUser,
        `Consultation ${statusLabel}`,
        `The status of your consultation for "${con.subject}" has been updated to ${status}.`,
        status === 'cancelled' ? NotificationType.ERROR : NotificationType.SUCCESS,
        '/profile'
      );

      toast.success(`Consultation ${status}`);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg dark:bg-slate-950 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-sleek-lg p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 mb-10 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
             <img 
              src={userData?.photoURL || `https://ui-avatars.com/api/?name=${userData?.displayName}&background=0ea5e9&color=fff`} 
              className="w-40 h-40 rounded-sleek object-cover border-4 border-white dark:border-slate-800 shadow-2xl" 
              alt="" 
            />
            {userData?.role === 'doctor' && (
              <div className="absolute -bottom-3 -right-3 p-3 bg-brand rounded-2xl shadow-xl border-4 border-white dark:border-slate-800">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="text-center lg:text-left flex-grow relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
              <h1 className="text-4xl font-black dark:text-white tracking-tight italic">
                {userData?.displayName}
              </h1>
              <span className="inline-flex px-4 py-1 bg-brand/10 dark:bg-brand/20 border border-brand/20 text-brand text-[10px] font-black uppercase tracking-widest rounded-full">
                {userData?.role}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium tracking-tight text-lg">{userData?.email}</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-6">
              <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-brand" />
                </div>
                <span>Member since {userData?.createdAt ? new Date(userData.createdAt).getFullYear() : '2024'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-green-500">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <span className="uppercase tracking-widest text-[10px]">Verified Account</span>
              </div>
            </div>
          </div>
          <button className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand rounded-2xl transition-all border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1 space-y-3">
            <NavBtn active={activeTab === 'consultations'} onClick={() => setActiveTab('consultations')} icon={<Stethoscope />} label="Consultations" count={consultations.length} />
            <NavBtn active={activeTab === 'messages'} onClick={() => setActiveTab('messages')} icon={<MessageSquare />} label="Support Center" />
            <NavBtn active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell />} label="Update Log" count={unreadCount} />
            <NavBtn active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<UserIcon />} label="Security Settings" />
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white dark:bg-slate-900 rounded-sleek-lg p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 min-h-[600px]"
              >
                {activeTab === 'consultations' && (
                  <div>
                    <h3 className="text-2xl font-black dark:text-white mb-8 tracking-tight italic">Medical <span className="text-brand">History</span></h3>
                    {loading ? (
                      <div className="space-y-6">
                        {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-50 dark:bg-slate-800 rounded-sleek animate-pulse" />)}
                      </div>
                    ) : consultations.length > 0 ? (
                      <div className="space-y-6">
                        {consultations.map(con => (
                          <div key={con.id} className="group p-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-sleek flex items-center justify-between hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl transition-all cursor-pointer">
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                con.status === 'requested' ? "bg-yellow-500 text-white" :
                                con.status === 'scheduled' ? "bg-brand text-white" :
                                con.status === 'completed' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                              )}>
                                {con.status === 'requested' ? <Clock className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                              </div>
                              <div className="flex-grow">
                                <h4 className="text-xl font-black dark:text-white tracking-tight">{con.subject}</h4>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                  <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                    con.status === 'requested' ? "bg-yellow-100 text-yellow-700" :
                                    con.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                                    con.status === 'completed' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                  )}>{con.status}</span>
                                  
                                  {userData?.role === 'doctor' && con.status === 'requested' && (
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleConsultationAction(con, 'scheduled'); }}
                                        className="text-[10px] font-black text-brand hover:underline"
                                      >
                                        ACCEPT
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleConsultationAction(con, 'cancelled'); }}
                                        className="text-[10px] font-black text-red-500 hover:underline"
                                      >
                                        REJECT
                                      </button>
                                    </div>
                                  )}
                                  
                                  {con.status === 'scheduled' && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleConsultationAction(con, 'completed'); }}
                                      className="text-[10px] font-black text-green-500 hover:underline"
                                    >
                                      MARK COMPLETED
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right hidden md:block">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Created</p>
                              <p className="text-sm font-bold dark:text-slate-300">{formatDate(con.requestDate)}</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-brand group-hover:shadow-md transition-all">
                              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="No medical history found. Start your journey by booking a consultation." />
                    )}
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                      <h3 className="text-2xl font-black dark:text-white tracking-tight italic">Update <span className="text-brand">Log</span></h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => user && notificationService.markAllAsRead(user.uid)}
                          className="text-[10px] font-black uppercase tracking-widest text-brand hover:underline"
                        >
                          Clear All Unread
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-4">
                        {notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => markNotifRead(notif.id)}
                            className={cn(
                              "p-6 rounded-sleek border-2 transition-all cursor-pointer relative overflow-hidden group",
                              notif.read 
                                ? "bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 opacity-60" 
                                : "bg-brand/5 dark:bg-brand/10 border-brand/20 shadow-xl shadow-brand/5"
                            )}
                          >
                             {!notif.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />}
                             <div className="flex items-start gap-5">
                               <div className={cn(
                                 "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                                 notif.read ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-brand text-white"
                               )}>
                                 <Bell className="w-6 h-6" />
                               </div>
                               <div className="flex-grow">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="font-black text-lg dark:text-white tracking-tight">{notif.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(notif.createdAt)}</p>
                                  </div>
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{notif.body}</p>
                               </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Your activity feed is clear. We'll post updates here." />
                    )}
                  </div>
                )}

                {activeTab === 'messages' && (
                   <div className="flex flex-col items-center justify-center h-full text-center py-20">
                      <div className="w-24 h-24 bg-brand/10 rounded-sleek flex items-center justify-center mb-8 text-brand shadow-inner">
                        <MessageSquare className="w-12 h-12" />
                      </div>
                      <h3 className="text-3xl font-black dark:text-white mb-4 tracking-tight">Direct Support</h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-10 font-medium leading-relaxed">Need help? Connect with our dedicated healthcare support team for instant assistance.</p>
                      <button className="px-10 py-4 bg-brand text-white font-black rounded-xl shadow-2xl shadow-brand/30 hover:bg-brand-hover transition-all hover:-translate-y-1 active:scale-95">
                        Start Real-time Chat
                      </button>
                   </div>
                )}

                {activeTab === 'info' && (
                   <div className="space-y-10">
                      <h3 className="text-2xl font-black dark:text-white mb-8 tracking-tight italic">Personal <span className="text-brand">Data</span></h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoCard label="Full Name" value={userData?.displayName || 'Not set'} />
                        <InfoCard label="Email Address" value={userData?.email || 'Not set'} />
                        <InfoCard label="Identity Role" value={userData?.role?.toUpperCase() || 'CLIENT'} />
                        <InfoCard label="Account Status" value="ACTIVE & VERIFIED" />
                      </div>
                      <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
                        <button className="px-8 py-3 bg-red-500/10 text-red-500 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          Request Data Deletion
                        </button>
                      </div>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label, count }: any) => (
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

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-sleek shadow-inner group transition-all hover:bg-white dark:hover:bg-slate-900">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-brand transition-colors">{label}</p>
    <p className="text-lg font-black dark:text-white tracking-tight">{value}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6 text-slate-300">
      <FileText className="w-8 h-8" />
    </div>
    <p className="text-slate-500">{message}</p>
  </div>
);

export default Profile;
