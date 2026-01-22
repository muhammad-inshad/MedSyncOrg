
export interface BaseUser {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin' | 'superadmin';
  phone: string | number;
  isActive: boolean;          
  isAccountVerified: boolean;  
  profileImage?: string;
}

export interface PatientProfile extends BaseUser {
  role: 'patient';
  bloodGroup: string;
  fatherName: string;
  isProfileComplete: boolean;
}

export interface DoctorProfile extends BaseUser {
  role: 'doctor';
  specialization: string;
  qualification: string;
  experience: string;
  licence: string;
}

export interface AdminProfile extends BaseUser {
  role: 'admin' | 'superadmin';
  permissions: string[];
}

export type ProfileData = PatientProfile | DoctorProfile | AdminProfile;

export interface AuthState {
  user: BaseUser | null;
  userRole: string | null;
  isAuthenticated: boolean;
  profileData: ProfileData | null; 
  loading: boolean;
}