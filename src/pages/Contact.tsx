import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Github, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const Contact = () => {
  const { user } = useAuth();
  const { language, translate } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to send a message');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'support_messages'), {
        senderId: user.uid,
        content: formData.message,
        subject: formData.subject,
        createdAt: new Date().toISOString(),
        type: 'text'
      });
      toast.success(language === 'ar' ? 'تم إرسال الرسالة! سنقوم بالرد عليك قريباً.' : 'Message sent! We will get back to you soon.');
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: language === 'ar' ? "دعم البريد" : "Email Support",
      value: "hello@estasharni.com",
      color: "bg-brand/10 text-brand border border-brand/20"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: language === 'ar' ? "الخط الساخن" : "Support Hotline",
      value: "+966 50 000 0000",
      color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: language === 'ar' ? "المقر العالمي" : "Global HQ",
      value: language === 'ar' ? "برج المملكة، الرياض، السعودية" : "Kingdom Tower, Riyadh, SA",
      color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
    }
  ];

  return (
    <div className="bg-surface-bg dark:bg-slate-950 min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-black text-slate-900 dark:text-white mb-6 italic tracking-tight"
          >
            {language === 'ar' ? 'كيف يمكننا' : 'How Can We'} <span className="text-brand">{language === 'ar' ? 'مساعدتك؟' : 'Help?'}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-xl font-medium leading-relaxed"
          >
            {language === 'ar' 
              ? 'هل لديك استفسار، تعليق، أو تحتاج إلى مساعدة؟ فريق منسقي الرعاية لدينا متاح 24/7 لمساعدتك في رحلتك الصحية.'
              : 'Have a question, feedback, or need support? Our team of medical coordinators is available 24/7 to assist with your specific health journey.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Info Side */}
          <div className="lg:col-span-1 space-y-10">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-sleek shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800">
               <h3 className="text-2xl font-black dark:text-white mb-10 tracking-tight italic">
                 {language === 'ar' ? 'اتصل' : 'Contact'} <span className="text-brand text-xs not-italic uppercase tracking-[0.2em] ml-2 font-bold">{language === 'ar' ? 'بنا' : 'Inquiry'}</span>
               </h3>
               <div className="space-y-8">
                 {contactInfo.map((info, idx) => (
                   <div key={idx} className={cn("flex items-center gap-5", language === 'ar' && "flex-row-reverse text-right")}>
                     <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg", info.color)}>
                        {info.icon}
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{info.label}</p>
                       <p className="font-extrabold text-lg dark:text-white tracking-tight">{info.value}</p>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{language === 'ar' ? 'التواجد الرقمي' : 'Online Presence'}</p>
                  <div className={cn("flex gap-4", language === 'ar' && "flex-row-reverse")}>
                    {[Twitter, Github, Linkedin].map((Icon, i) => (
                      <button key={i} className="w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 hover:text-brand hover:border-brand/20 transition-all shadow-sm flex items-center justify-center group">
                        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="bg-brand rounded-sleek p-10 text-white relative overflow-hidden shadow-2xl shadow-brand/30">
               <MessageCircle className="absolute -bottom-10 -right-10 w-48 h-48 text-white opacity-20" />
               <h4 className="text-2xl font-black mb-4 relative z-10 tracking-tight italic">{language === 'ar' ? 'مركز الدردشة الحية' : 'Live Chat Hub'}</h4>
               <p className="text-white/80 mb-10 relative z-10 font-bold leading-relaxed">{language === 'ar' ? 'للمشاكل التقنية الفورية أو استفسارات الحجز العاجلة، استخدم مراسلنا في الوقت الفعلي.' : 'For immediate technical issues or urgent booking queries, use our real-time messenger.'}</p>
               <button className="px-8 py-3 bg-white text-brand font-black rounded-xl relative z-10 hover:bg-slate-50 transition-all shadow-xl active:scale-95 uppercase text-xs tracking-widest">
                 {language === 'ar' ? 'تواصل الآن' : 'Connect Now'}
               </button>
            </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-2">
             <motion.div 
               initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="bg-white dark:bg-slate-900 p-10 lg:p-16 rounded-sleek shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 h-full relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className={cn("flex items-center gap-6 mb-12 border-b border-slate-100 dark:border-slate-800 pb-10", language === 'ar' && "flex-row-reverse text-right")}>
                  <div className="w-16 h-16 bg-brand rounded-2xl text-white flex items-center justify-center shadow-2xl shadow-brand/30 scale-110">
                    <Send className={cn("w-7 h-7", language === 'ar' && "rotate-180")} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">{language === 'ar' ? 'رسالة مباشرة' : 'Direct Message'}</h2>
                    <p className="text-slate-500 font-medium italic mt-1 font-sans">{language === 'ar' ? 'نتوقع الرد خلال أقل من 120 دقيقة' : 'Expect response under 120 minutes'}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 block", language === 'ar' && "text-right")}>{language === 'ar' ? 'موضوع الرسالة' : 'Message Subject'}</label>
                    <input 
                      type="text" 
                      required
                      placeholder={language === 'ar' ? 'مثال: تأكيد الحجز، مشكلة في الملف الشخصي...' : 'e.g. Booking Confirmation, Profile Issue...'}
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className={cn("w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white font-bold", language === 'ar' && "text-right")}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 block", language === 'ar' && "text-right")}>{language === 'ar' ? 'رسالة مفصلة' : 'Detailed Message'}</label>
                    <textarea 
                      required
                      rows={8}
                      placeholder={language === 'ar' ? 'صف استفسارك بالتفصيل حتى نتمكن من مساعدتك بشكل أسرع...' : 'Describe your inquiry in detail so we can help faster...'}
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      className={cn("w-full px-6 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-brand/10 outline-none transition-all dark:text-white resize-none font-medium leading-relaxed", language === 'ar' && "text-right")}
                    />
                  </div>
                  <div className={cn("flex", language === 'ar' ? "justify-start" : "justify-end")}>
                    <button 
                      disabled={loading}
                      className="w-full lg:w-auto px-16 py-5 bg-brand hover:bg-brand-hover text-white font-black rounded-sleek shadow-2xl shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-4 text-xl tracking-tight active:scale-95"
                    >
                      {loading ? (language === 'ar' ? "جاري الإرسال..." : "Sending...") : (language === 'ar' ? "إرسال الرسالة" : "Dispatch Message")}
                      <Send className={cn("w-6 h-6", language === 'ar' && "rotate-180")} />
                    </button>
                  </div>
                </form>
             </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
