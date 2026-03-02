import { IPaginationResult } from "../../../../types/hospital.types.ts";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { IPatient } from "../../../../models/Patient.model.ts";

export interface IPatientManagementService {
    patientsToggle(id: string): Promise<PatientResponseDTO | null>;
    addPatient(data: Partial<IPatient>, hospital_id: string, file?: Express.Multer.File): Promise<PatientResponseDTO>;
    updatePatient(id: string, data: Partial<IPatient>, file?: Express.Multer.File): Promise<PatientResponseDTO | null>;
    getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }): Promise<IPaginationResult<PatientResponseDTO>>;
}
