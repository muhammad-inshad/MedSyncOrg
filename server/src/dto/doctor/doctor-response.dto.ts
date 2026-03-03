import { Types } from 'mongoose';

export interface DoctorResponseDTO {
  id: string;
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  qualification: string;
  experience: string;
  department: string;
  hospital_id?: string;
  about: string;
  licence: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isAccountVerified: boolean;
  walletBalance: number;
  reviewStatus: "pending" | "approved" | "revision" | "rejected";
  reapplyDate?: Date;
  rejectionReason?: string;
  availableSlots: string[];
  consultationTime: {
    start: string;
    end: string;
  };
  payment: {
    type: "commission" | "fixed";
    commissionPercentage?: number;
    fixedSalary?: number;
    payoutCycle: "weekly" | "monthly";
    patientsPerDayLimit: number;
  };
  createdAt: Date;
  updatedAt: Date;

}

export interface UpdateDoctorDTO {
  id: string;
  name?: string;
  phone?: string;
  address?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  department?: string;
  hospital_id?: Types.ObjectId | string;
  about?: string;
  licence?: string;
  consultationTime?: {
    start: string;
    end: string;
  };

  availableSlots?: string[];

  payment?: {
    type?: "commission" | "fixed";
    commissionPercentage?: number;
    fixedSalary?: number;
    payoutCycle?: "weekly" | "monthly";
    patientsPerDayLimit?: number;
  };

  profileImage?: string;
  isActive?: boolean | string;
  isAccountVerified?: boolean | string;
  licenseImage?: string;
  rejectionReason?: string;
  profileImageFile?: Express.Multer.File;
  licenseFile?: Express.Multer.File;
  currentPassword?: string;
  newPassword?: string;
}