import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        type: 'contact',
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-display font-black mb-4">تواصل معنا</h1>
        <p className="text-slate-500 max-w-xl mx-auto">لديك سؤال أو استفسار؟ فريقنا متاح دائماً لمساعدتك وضمان حصولك على أفضل تجربة ممكنة.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/50 p-12 rounded-[2.5rem] text-center"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-green-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-display font-black text-green-900 dark:text-green-400 mb-2">تم الإرسال بنجاح!</h2>
              <p className="text-green-700 dark:text-green-500 mb-8">شكراً لتواصلك معنا. سنقوم بالرد عليك في أقرب وقت ممكن.</p>
              <button
                onClick={() => setSuccess(false)}
                className="text-green-700 font-bold hover:underline"
              >
                إرسال رسالة أخرى
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-12 rounded-[2.5rem] shadow-sm">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 mr-1 text-right">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none focus:border-sky-500 transition-all text-right"
                    placeholder="اسمك الكريم"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 mr-1 text-right">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none focus:border-sky-500 transition-all text-right"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 mr-1 text-right">الموضوع</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none focus:border-sky-500 transition-all text-right"
                  placeholder="كيف يمكننا مساعدتك؟"
                />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 mr-1 text-right">الرسالة</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl outline-none focus:border-sky-500 transition-all text-right resize-none"
                  placeholder="اكتب رسالتك هنا بالتفصيل..."
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white p-5 rounded-2xl font-bold transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Send size={20} className="rotate-180" />}
                إرسال الرسالة
              </button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <ContactCard
            icon={<Mail className="text-sky-500" />}
            title="البريد الإلكتروني"
            value="support@estasharni.com"
          />
          <ContactCard
            icon={<Phone className="text-green-500" />}
            title="اتصل بنا"
            value="+966 50 123 4567"
          />
          <ContactCard
            icon={<MessageSquare className="text-purple-500" />}
            title="دردشة حية"
            value="متاحون 24/7"
          />
          
          <div className="bg-sky-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <h3 className="text-xl font-display font-black mb-4 relative z-10">هل تحتاج لمساعدة فورية؟</h3>
            <p className="text-sky-100 text-sm mb-6 relative z-10 leading-relaxed">يمكنك البدء بمحادثة فورية مع فريق الدعم الفني بالنقر على زر الدردشة في أسفل الصفحة.</p>
            <button className="bg-white text-sky-500 px-6 py-3 rounded-xl font-bold text-sm hover:bg-sky-50 transition-colors relative z-10">ابدأ الدردشة</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex items-center gap-5">
      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
        {icon}
      </div>
      <div className="text-right">
        <h4 className="text-xs font-bold text-slate-400 mb-1">{title}</h4>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
