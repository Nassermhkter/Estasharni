import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.doctors': 'Find Doctors',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin',
    'hero.title': 'The Future of Medical',
    'hero.title.span': 'Consultation',
    'hero.desc': 'Connect with board-certified specialists in clinical medicine and sports science. Instant, secure, and professional guidance for your health journey.',
    'hero.cta.start': 'Start Consultation',
    'hero.cta.browse': 'Browse Specialists',
    'admin.back': 'Return to Portal',
    'admin.terminal': 'Terminal',
    'admin.admin': 'Admin',
    'auth.back': 'Back to Portal',
    'auth.welcome': 'Welcome Back',
    'auth.choose_identity': 'Please choose your identity and sign in',
    'auth.patient': 'Patient',
    'auth.doctor': 'Doctor',
    'auth.continue_google': 'Continue with Google',
    'auth.continue_facebook': 'Continue with Facebook',
    'auth.or_continue': 'Or continue with',
    'auth.email_pass': 'Email & Password',
    'auth.login_title': 'Authorize Session',
    'auth.register_title': 'Create Session',
    'auth.need_account': 'Need an account? Sign up',
    'auth.have_account': 'Already have access? Login',
    'auth.full_name': 'Full Identity Name',
    'auth.email': 'Email Address',
    'auth.password': 'Password Access',
    'footer.copy': 'All rights reserved © Estasharni 2024',
    'footer.location': 'Yemen, Aden',
    'footer.address': '90th Street, Aden',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.doctors': 'البحث عن أطباء',
    'nav.about': 'عن المنصة',
    'nav.contact': 'اتصل بنا',
    'nav.profile': 'الملف الشخصي',
    'nav.admin': 'لوحة التحكم',
    'hero.title': 'مستقبل الاستشارات',
    'hero.title.span': 'الطبية',
    'hero.desc': 'تواصل مع أخصائيين معتمدين في الطب السريري وعلوم الرياضة. إرشادات فورية وآمنة ومهنية لرحلتك الصحية.',
    'hero.cta.start': 'ابدأ الاستشارة',
    'hero.cta.browse': 'تصفح الأخصائيين',
    'admin.back': 'العودة للمنصة',
    'admin.terminal': 'لوحة التحكم',
    'admin.admin': 'المدير العام',
    'auth.back': 'العودة للمنصة',
    'auth.welcome': 'مرحباً بك مجدداً',
    'auth.choose_identity': 'يرجى اختيار هويتك وتسجيل الدخول',
    'auth.patient': 'مريض',
    'auth.doctor': 'طبيب',
    'auth.continue_google': 'المتابعة عبر جوجل',
    'auth.continue_facebook': 'المتابعة عبر فيسبوك',
    'auth.or_continue': 'أو المتابعة عبر',
    'auth.email_pass': 'البريد وكلمة المرور',
    'auth.login_title': 'تسجيل الدخول للبريد',
    'auth.register_title': 'إنشاء حساب جديد',
    'auth.need_account': 'ليس لديك حساب؟ سجل الآن',
    'auth.have_account': 'لديك حساب بالفعل؟ سجل دخولك',
    'auth.full_name': 'الاسم الكامل',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'footer.copy': 'جميع الحقوق محفوظة © استشارني 2024',
    'footer.location': 'اليمن، عدن',
    'footer.address': 'شارع التسعين، عدن',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key: string) => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={language === 'ar' ? 'font-sans' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
