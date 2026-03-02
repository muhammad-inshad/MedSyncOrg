
export interface IPatient  {
    
  _id: string; 
  name: string;
  email: string;
  phone: number;
  password: string;
  isGoogleAuth: boolean;

  fatherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  address?: string;
  isActive:boolean;
  image?: string;
  bloodGroup?: string;

  walletBalance: number;
  medicalReports: string[];

  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}