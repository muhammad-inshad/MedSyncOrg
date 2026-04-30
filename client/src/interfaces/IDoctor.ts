
export interface IDoctor {

  id: string; // MongoDB ID
  
  name: string;
  email: string;
  phone: string;
  address: string;

  specialization: string;
  qualification: string;
  experience: string;
  department: string;

  hospital_id?: string; // ObjectId becomes string in frontend
specialization_id?:string;
department_id?:string;
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

  monthlyAmount: number;
  patientsPerDayLimit: number;

  createdAt: string; // Date → string (ISO format)
  updatedAt: string;
}


export interface CreateDoctorSchedulePayload {
    daysOfWeek: number[];                  
    session: 'morning' | 'afternoon' | 'evening';
    startTime: string;                      
    endTime: string;                    
    slotDuration: number;                
}

export interface SalaryHikeRequestinterface{
  doctorId:string,
  hospitalId:string,
  requestedSalary:string,
  reason:string,
  currentSalary:number
}