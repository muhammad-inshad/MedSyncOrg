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