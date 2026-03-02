export interface IDoctor {

  _id: string; // MongoDB ID

  name: string;
  email: string;
  phone: string;
  address: string;

  specialization: string;
  qualification: string;
  experience: string;
  department: string;

  hospital_id?: string; // ObjectId becomes string in frontend

  licence: string;
  profileImage: string;
  about: string;

  rating: number;
  reviewCount: number;

  isActive: boolean;
  isAccountVerified: boolean;
  reviewStatus?: "pending" | "approved" | "revision" | "rejected";
  reapplyDate?: string;
  rejectionReason?: string;
  walletBalance: number;

  availableSlots: string[];

  consultationTime: {
    start?: string;
    end?: string;
  };

  payment: {
    type?: "commission" | "fixed";

    commissionPercentage?: number;
    fixedSalary?: number;

    payoutCycle?: "weekly" | "monthly";
    patientsPerDayLimit?: number;
  };

  createdAt: string; // Date → string (ISO format)
  updatedAt: string;
}
