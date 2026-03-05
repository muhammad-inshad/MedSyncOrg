import { HospitalResponseDTO, selectedHospitalDto } from "../../dto/hospital/hospital-response.dto.ts";
import { UpdatePatientDTO } from "../../dto/patient/patient-response.dto.ts";

export interface IPatientService {
    getProfile(patientId: string): Promise<unknown>;
    updateProfile(patientId: string, updateData: UpdatePatientDTO): Promise<unknown>;
    getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }): Promise<{ data: unknown[]; total: number }>;
    gethospitals(page: number, limit: number, search: string): Promise<{ 
        hospitals:HospitalResponseDTO[]; 
        totalCount: number; 
        totalPages: number; 
        currentPage: number; 
    }>;
    changePassword(id: string, currentPassword: string, newPassword: string): Promise<void>;
    selectedHospital(id:string):Promise<selectedHospitalDto>;
}