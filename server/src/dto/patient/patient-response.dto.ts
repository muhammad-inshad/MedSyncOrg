export interface PatientResponseDTO {
  id: string;
  _id: string;
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
export interface UpdatePatientDTO {
  name?: string;
  phone?: number;
  email: string;
  fatherName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  address?: string;
  bloodGroup?: string;

  image?: string;
  willRemoveImage?: boolean;

  isActive?: boolean;
}