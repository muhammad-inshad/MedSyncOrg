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


