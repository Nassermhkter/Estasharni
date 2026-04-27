import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DoctorProfile, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Star, Calendar, ArrowRight, Filter, X, Clock, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { notificationService, NotificationType } from '../lib/notifications';
import toast from 'react-hot-toast';

const Doctors = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<(DoctorProfile & { user: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  
  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<(DoctorProfile & { user: User }) | null>(null);
  const [bookingSubject, setBookingSubject] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const specialties = [
    { en: 'All', ar: 'الكل' },
    { en: 'Cardiology', ar: 'أمراض القلب' },
    { en: 'Dermatology', ar: 'الأمراض الجلدية' },
    { en: 'Neurology', ar: 'الأعصاب' },
    { en: 'Pediatrics', ar: 'طب الأطفال' },
    { en: 'Psychiatry', ar: 'الطب النفسي' },
    { en: 'General Medicine', ar: 'الطب العام' }
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorsQuery = query(
          collection(db, 'doctors'),
          where('approvalStatus', '==', 'approved')
        );
        const querySnapshot = await getDocs(doctorsQuery);
        
        const doctorData = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const profile = docSnap.data() as DoctorProfile;
            const userDoc = await getDoc(doc(db, 'users', profile.userId));
            const user = userDoc.data() as User;
            return { ...profile, user };
          })
        );
        
        setDoctors(doctorData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDoctor) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لحجز استشارة' : 'Please login to book a consultation');
      return;
    }

    setIsBooking(true);
    try {
      const consultationData = {
        clientId: user.uid,
        doctorId: selectedDoctor.userId,
        status: 'requested',
        requestDate: new Date().toISOString(),
        subject: bookingSubject,
        notes: bookingNotes,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'consultations'), consultationData);

      // Send notification to doctor
      await notificationService.send(
        selectedDoctor.userId,
        language === 'ar' ? 'طلب استشارة جديد!' : 'New Consultation Request!',
        language === 'ar' 
          ? `${userData?.displayName || 'مريض'} أرسل طلب استشارة بخصوص: ${bookingSubject}`
          : `${userData?.displayName || 'A patient'} has requested a consultation regarding: ${bookingSubject}`,
        NotificationType.APPOINTMENT,
        '/profile'
      );

      toast.success(language === 'ar' ? 'تم إرسال طلب الاستشارة بنجاح!' : 'Consultation request sent successfully!');
      setSelectedDoctor(null);
      setBookingSubject('');
      setBookingNotes('');
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل إرسال الطلب' : 'Failed to send request');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-surface-bg dark:bg-slate-950 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-right">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            {language === 'ar' ? 'أطباؤنا' : 'Our'} <span className="text-brand">{language === 'ar' ? 'المختصون' : 'Specialists'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {language === 'ar' ? 'احجز موعداً مع نخبة من الخبراء الطبيين المعتمدين من جميع أنحاء العالم.' : 'Book an appointment with board-certified medical experts from various fields worldwide.'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-8 mb-16">
          <div className="relative flex-grow group">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand transition-colors", language === 'ar' ? 'right-5' : 'left-5')} />
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث بالاسم، التخصص، أو العيادة...' : 'Search by name, specialty, or clinic...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full py-4 rounded-sleek border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all dark:text-white shadow-sm font-medium",
                language === 'ar' ? 'pr-14 pl-6' : 'pl-14 pr-6'
              )}
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Filter className="w-4 h-4 text-slate-400 ml-2" />
              {specialties.map(spec => (
                <button
                  key={spec.en}
                  onClick={() => setSelectedSpecialty(spec.en)}
                  className={cn(
                    "px-5 py-2 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-widest transition-all",
                    selectedSpecialty === spec.en 
                      ? "bg-brand text-white shadow-lg shadow-brand/20" 
                      : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  {language === 'ar' ? spec.ar : spec.en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-96 bg-white dark:bg-slate-800 rounded-3xl animate-pulse shadow-sm border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredDoctors.map((doc, idx) => (
              <motion.div
                key={doc.userId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white dark:bg-slate-900 rounded-sleek shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img 
                    src={doc.user.photoURL || `https://ui-avatars.com/api/?name=${doc.user.displayName}&background=0ea5e9&color=fff`} 
                    alt={doc.user.displayName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-5 right-5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xl border border-white/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-black dark:text-white">4.9</span>
                  </div>
                  <div className={cn("absolute bottom-5 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0", language === 'ar' ? 'right-5' : 'left-5')}>
                    <span className="px-3 py-1 bg-brand text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {language === 'ar' ? 'متاح للاستشارة' : 'Available for Chat'}
                    </span>
                  </div>
                </div>

                <div className="p-8 text-right">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand transition-colors tracking-tight">
                      {language === 'ar' ? 'د.' : 'Dr.'} {doc.user.displayName}
                    </h3>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                      <p className="text-brand font-bold text-sm tracking-tight italic">
                        {language === 'ar' ? specialties.find(s => s.en === doc.specialty)?.ar : doc.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-end gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <span className="tracking-tight">{language === 'ar' ? 'الرياض، السعودية' : 'Riyadh Specialized Center'}</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full py-4 bg-brand hover:bg-brand-hover text-white font-black rounded-xl transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-3 active:scale-95 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {language === 'ar' ? 'طلب استشارة' : 'Request Consultation'}
                    <ArrowRight className={cn("w-5 h-5 group-hover:translate-x-1 transition-transform", language === 'ar' && "rotate-180")} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold dark:text-white mb-2">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search or filter settings.</p>
          </div>
        )}
        {/* Booking Modal */}
        <AnimatePresence>
          {selectedDoctor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedDoctor(null)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-sleek-lg shadow-2xl p-8 lg:p-12 overflow-hidden"
              >
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="absolute top-8 right-8 p-3 text-slate-400 hover:text-brand transition-all rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-6 mb-10 border-b border-slate-100 dark:border-slate-800 pb-8">
                  <div className="w-20 h-20 bg-brand rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-brand/30">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight italic">Request <span className="text-brand">Consultation</span></h2>
                    <p className="text-slate-500 font-medium italic">Booking with Dr. {selectedDoctor.user.displayName}</p>
                  </div>
                </div>

                <form onSubmit={handleBook} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consultation Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Briefly describe your concern..."
                      value={bookingSubject}
                      onChange={e => setBookingSubject(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-bold"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Notes (Optional)</label>
                    <textarea 
                      rows={4}
                      placeholder="Symptoms, history, or specific questions..."
                      value={bookingNotes}
                      onChange={e => setBookingNotes(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-medium resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 p-5 bg-brand/5 dark:bg-brand/10 border border-brand/20 rounded-xl">
                    <Clock className="w-6 h-6 text-brand" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                      Your request will be sent to the doctor. They will review it and coordinate a time with you via real-time messenger.
                    </p>
                  </div>

                  <button 
                    disabled={isBooking}
                    className="w-full py-5 bg-brand hover:bg-brand-hover text-white font-black rounded-sleek shadow-2xl shadow-brand/30 transition-all flex items-center justify-center gap-4 text-xl tracking-tight active:scale-95 disabled:opacity-50"
                  >
                    {isBooking ? 'Sending Request...' : 'Confirm Request'}
                    <Send className="w-6 h-6" />
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Doctors;
