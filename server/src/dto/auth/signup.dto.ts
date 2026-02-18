export interface SignupDTO {
  name: string;
  email: string;
  phone: number;
  password: string;
  role: 'patient' | 'admin' | 'doctor';
}

export interface LoginDTO {
  email: string;
  password: string;
  role: 'patient' | 'admin' | 'doctor';
}

export interface SendOtpDTO {
  email: string;
}

export interface VerifyOtpDTO {
  email: string;
  otp: string;
  signupData?: SignupDTO;
}

export interface ResetPasswordDTO {
  email: string;
  newPassword: string;
}

export interface UpdateProfileDTO {
  name?: string;
  phone?: number;
  avatar?: string;
}

export interface loginResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: number;
  role: 'patient' | 'admin' | 'doctor';
  avatar?: string;
}

export interface PatientResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: number;
  isGoogleAuth: boolean;
  fatherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  address?: string;
  isActive?: boolean;
  image?: string;
  bloodGroup?: string;
  walletBalance: number;
  medicalReports: string[];
  hospital_id?: string;
  appointmentHistory: string[];
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DoctorDTO {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;

  specialization: string;
  qualification: string;
  experience: string;
  department: string;
  about: string;

  licence: string;
  profileImage: string;

  isActive: boolean;
  isAccountVerified: boolean;
  reviewStatus: "pending" | "approved" | "revision" | "rejected";

  consultationTime: {
    start: string;
    end: string;
  };
}

export type DoctorSignupDTO = DoctorDTO;


