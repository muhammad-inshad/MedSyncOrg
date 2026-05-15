import { PatientResponseDTO, CreatePatientDTO, UpdatePatientDTO } from "../../../../dto/patient/patient-response.dto.js";

export interface IPatientManagementService {
  addPatient(patientData: CreatePatientDTO, hospital_id: string, patientFile?: Express.Multer.File): Promise<PatientResponseDTO>;
  patientsToggle(id: string): Promise<PatientResponseDTO>;
  updatePatient(id: string, patientData: UpdatePatientDTO, patientFile?: Express.Multer.File): Promise<PatientResponseDTO>;
  getAllPatient(query: { page: number; limit: number; search: string; filter?: "all" | "active" | "blocked"; hospital_id: string }): Promise<{ data: PatientResponseDTO[]; total: number }>;
}
