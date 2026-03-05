import { IHospital } from "../../models/hospital.model.ts";

export interface HospitalResponseDTO {
  id: string;
  _id: string;
  hospitalName: string;
  logo?: string;
  address: string;
  isActive: boolean;
  autoDisabled: boolean;
  email: string;
  phone: string;
  since: number;
  pincode: string;
  about?: string;
  licence?: string;
  income: number;
   images: {
    landscape: string[];
    medicalTeam: string[];
    patientCare: string[];
    services: string[];
  };
  reviewStatus: "pending" | "approved" | "revision" | "rejected";
  reapplyDate?: Date;
  rejectionReason?: string;
  subscription: {
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: Date;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthHOspitalPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface selectedHospitalDto {
  _id:string;
  hospitalName: string;
  logo?: string;
  address: string;

  isActive: boolean;
  autoDisabled: boolean;

  images: {
    landscape: string[];
    medicalTeam: string[];
    patientCare: string[];
    services: string[];
  };

  email: string;
  phone: string;

  since: number;
  pincode: string;
  about?: string;
  licence?: string;
  
}


export interface IHospitalUpdateDTO {
    hospitalName?: string;
    logo?: string;
    address?: string;
    email?: string;
    phone?: string;
    since?: number | string;
    pincode?: string;
    about?: string;
    licence?: string;
    isActive?: boolean | string;
    password?: string;
    confirmPassword?: string;
    subscription?: string | IHospital['subscription'];
    images?: string | IHospital['images'];
}