import { IPaginationResult } from "../../../../types/hospital.types.js";
import { PatientResponseDTO, CreatePatientDTO, UpdatePatientDTO } from "../../../../dto/patient/patient-response.dto.js";

export interface ISuperAdminPatientManagementService {
    getAllPatients(options: { page: number; limit: number; search?: string; status?: string }): Promise<IPaginationResult<PatientResponseDTO>>;
    togglePatientActive(id: string, isActive: boolean): Promise<PatientResponseDTO | null>;
    updatePatient(id: string, data: UpdatePatientDTO, file?: Express.Multer.File): Promise<PatientResponseDTO | null>;
    addPatient(data: CreatePatientDTO, hospital_id: string, file?: Express.Multer.File): Promise<PatientResponseDTO>;
}
