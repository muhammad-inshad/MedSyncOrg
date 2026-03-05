export interface IHospital {
  _id: string;
  id?: string;

  hospitalName: string;
  logo?: string;
  address: string;
  email: string;
  phone: string;

  isActive: boolean;
  autoDisabled?: boolean;

  since: number;
  pincode: string;
  about?: string;
  licence?: string;

  income?: number;

  reviewStatus?: "pending" | "approved" | "rejected" | "revision";
  reapplyDate?: string | Date | null;

  images?: {
    landscape: string[];
    medicalTeam: string[];
    patientCare: string[];
    services: string[];
  };

  subscription?: {
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: string | Date;
    endDate?: string | Date;
  };

  createdAt?: string;
  updatedAt?: string;

  __v?: number;
}