import { IPaginationResult } from "../../../../types/hospital.types.ts";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { IPatient } from "../../../../models/Patient.model.ts";

export interface ISuperAdminPatientManagementService {
    getAllPatients(options: { page: number; limit: number; search?: string; status?: string }): Promise<IPaginationResult<PatientResponseDTO>>;
    togglePatientActive(id: string, isActive: boolean): Promise<PatientResponseDTO | null>;
    updatePatient(id: string, data: Partial<IPatient> & { willRemoveImage?: string | boolean }, file?: Express.Multer.File): Promise<PatientResponseDTO | null>;
    addPatient(data: Partial<IPatient>, hospital_id: string, file?: Express.Multer.File): Promise<PatientResponseDTO>;
}
