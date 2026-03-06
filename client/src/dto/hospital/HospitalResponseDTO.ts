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
  departments: any[];
  totalDepartments: number;
  currentPage: number;
  totalPages: number;
}
