
export interface BaseUser {
  _id: string;
  id?: string;
  name: string;
  hospitalName?: string;
  email: string;
  role: 'patient' | 'doctor' | 'hospital' | 'superadmin';
  phone: string | number;
  isActive: boolean;
  isAccountVerified: boolean;
  profileImage?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected' | 'revision';
  rejectionReason?: string;
  image?: string;
  gender?: string;
  age?: number | string;
  address?: string;
  logo?:string;
  pincode?:string;
   since: number;
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
  address: string;
  department: string;
  about: string;
  consultationTime?: {
    start?: string;
    end?: string;
  };
  payment?: {
    type?: "commission" | "fixed";
    commissionPercentage?: number;
    fixedSalary?: number;
    payoutCycle?: "weekly" | "monthly";
    patientsPerDayLimit?: number;
  };
}

export interface HospitalProfile extends BaseUser {
  role: 'hospital' | 'superadmin';
  permissions: string[];
}

export type ProfileData = PatientProfile | DoctorProfile | HospitalProfile;

export interface AuthState {
  user: BaseUser | null;
  userRole: string | null;
  isAuthenticated: boolean;
  profileData: ProfileData | null;
  loading: boolean;
  isActive: boolean;
}