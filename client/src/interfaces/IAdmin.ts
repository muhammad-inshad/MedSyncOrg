export interface IAdmin {
  _id: string;
  hospitalName: string;
  logo?: string;
  address: string;
  email: string;
  phone: string;
  isActive: boolean;
  since: number;
  pincode: string;
  about?: string;
  licence?: string;
  income?: number;
  subscription?: {
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: string | Date;
    endDate?: string | Date;
  };
  createdAt?: string;
  updatedAt?: string;
}