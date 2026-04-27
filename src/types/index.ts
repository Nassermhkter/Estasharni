export type UserRole = 'client' | 'doctor' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ConsultationStatus = 'requested' | 'scheduled' | 'completed' | 'cancelled';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface DoctorProfile {
  userId: string;
  specialty: string;
  qualifications: string;
  experience: string;
  certificates: string[];
  bio: string;
  availability: any;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
}

export interface Consultation {
  id: string;
  clientId: string;
  doctorId: string;
  status: ConsultationStatus;
  requestDate: string;
  scheduledTime?: string;
  subject: string;
  notes?: string;
  clientName?: string;
  doctorName?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  consultationId?: string;
  content: string;
  createdAt: string;
  type: 'text' | 'file';
  url?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformSettings {
  platformName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  maintenanceMode: boolean;
}
