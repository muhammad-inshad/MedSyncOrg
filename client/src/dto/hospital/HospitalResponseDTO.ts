export interface DepartmentResponseDTO {
  _id: string;
  departmentName: string;
  description?: string;
  image?: string;
  doctorCount?: number;
}

export interface QualificationResponseDTO {
  _id: string;
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
}
