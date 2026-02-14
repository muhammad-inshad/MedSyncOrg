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