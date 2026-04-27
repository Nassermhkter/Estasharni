export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface DoctorData {
  id: string;
  userId?: string;
  name: string;
  email: string;
  specialty: string;
  experience: string;
  qualifications: string;
  bio: string;
  photo?: string;
  status: 'pending' | 'approved' | 'rejected';
  rating: number;
  createdAt: string;
}

export interface ConsultationData {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  from: 'user' | 'admin';
  fromName: string;
  text: string;
  time: string;
}

export const SPECIALTIES = [
  { name: 'أمراض القلب', icon: 'HeartPulse', color: '#EF4444' },
  { name: 'الجلدية', icon: 'HandHelping', color: '#F59E0B' },
  { name: 'الأعصاب', icon: 'Brain', color: '#8B5CF6' },
  { name: 'العظام', icon: 'Bone', color: '#06B6D4' },
  { name: 'طب الأطفال', icon: 'Baby', color: '#EC4899' },
  { name: 'الطب النفسي', icon: 'MessageSquare', color: '#10B981' },
  { name: 'الطب العام', icon: 'Stethoscope', color: '#0EA5E9' },
  { name: 'العيون', icon: 'Eye', color: '#6366F1' },
  { name: 'أنف وأذن وحنجرة', icon: 'Volume2', color: '#F97316' },
  { name: 'النساء والتوليد', icon: 'UserCircle', color: '#D946EF' },
  { name: 'المسالك البولية', icon: 'Droplets', color: '#14B8A6' },
  { name: 'الأورام', icon: 'Ribbon', color: '#F43F5E' }
];
