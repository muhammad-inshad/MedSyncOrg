export interface SubscriptionForm {
  _id?: string;
  plan: string;
  amount: number;
  status: "active" | "expired" | "cancelled";
  duration: number;
  durationUnit: "days" | "months" | "years";
  startDate?: string;
  endDate?: string;
  paymentId?: string;
  paymentMethod?: string;
  limits?: {
    maxPatients: number;
    maxDoctors: number;
    maxDepartments: number;
  };
}


export interface ISubscription {
  _id: string;
  plan: string;
  amount: number;
  duration?: number;
  durationUnit?: "days" | "months" | "years";
  startDate?: string;
  endDate?: string;
  features?: string[];
  isActive?: boolean;
  subscriberCount?: number;
  limits?: {
    maxPatients: number;
    maxDoctors: number;
    maxDepartments: number;
  };
  createdAt?: string;
  updatedAt?: string;
}