import { z } from 'zod';
import { Types } from 'mongoose';

export const DoctorResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    specialization: z.string(),
    qualification: z.string(),
    experience: z.string(),
    department: z.string(),
    hospital_id: z.string().optional(),
    about: z.string(),
    licence: z.string(),
    profileImage: z.string(),
    rating: z.number(),
    reviewCount: z.number(),
    isActive: z.boolean(),
    isAccountVerified: z.boolean(),
    walletBalance: z.number(),
    reviewStatus: z.enum(["pending", "approved", "revision", "rejected"]),
    reapplyDate: z.union([z.date(), z.string()]).optional(),
    rejectionReason: z.string().optional(),
    availableSlots: z.array(z.string()),
    consultationTime: z.object({
        start: z.string(),
        end: z.string(),
    }),
    payment: z.object({
        type: z.enum(["commission", "fixed"]),
        commissionPercentage: z.number().optional(),
        fixedSalary: z.number().optional(),
        payoutCycle: z.enum(["weekly", "monthly"]),
        patientsPerDayLimit: z.number(),
    }),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type DoctorResponseDTO = z.infer<typeof DoctorResponseSchema>;

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