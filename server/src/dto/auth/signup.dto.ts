export interface SignupDTO {
  name: string;
  email: string;
  phone: number;
  password: string;
  role: 'patient' | 'admin' | 'doctor' | 'hospital' | 'superAdmin';
}

export interface LoginDTO {
  email: string;
  password: string;
  role: 'patient' | 'admin' | 'doctor' | 'hospital' | 'superAdmin';
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
  role: 'patient' | 'admin' | 'doctor' | 'hospital' | 'superAdmin';
  avatar?: string;
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
  hospital_id:string;
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


