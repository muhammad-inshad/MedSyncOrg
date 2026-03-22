export interface DepartmentResponseDTO {
  _id: string;
  departmentName: string;
  description?: string;
  image?: string;
  doctorCount?: number;
}

export interface QualificationResponseDTO {
  _id: string;
  name: string;
  qualificationName: string;
  description?: string;
  image?: string;
}

export interface SpecializationResponseDTO {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  department_id: string;
}

export interface HospitalResponseDTO {
  id:string;
  _id: string;
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
  departments: DepartmentResponseDTO[];
  qualifications: QualificationResponseDTO[];
  specializations: SpecializationResponseDTO[];
  totalDepartments: number;
  currentPage: number;
  totalPages: number;
  subscription?: {
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: string | Date;
    endDate?: string | Date;
    limits?: {
      maxPatients: number;
      maxDoctors: number;
      maxDepartments: number;
    };
  };
  currentCounts?: {
    doctors: number;
    patients: number;
    departments: number;
  };
}
