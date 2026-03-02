import { UpdatePatientDTO } from "../../dto/patient/patient-response.dto.ts";

export interface IPatientService {
    getProfile(patientId: string): Promise<unknown>;
    updateProfile(patientId: string, updateData: UpdatePatientDTO): Promise<unknown>;
    getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }): Promise<{ data: unknown[]; total: number }>;
    gethospitals(): Promise<unknown[]>;
}