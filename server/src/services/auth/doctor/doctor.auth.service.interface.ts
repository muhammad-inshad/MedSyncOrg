import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.js";
import { DoctorUploadFiles } from "../../../types/doctor.types.js";
import { AuthTokens } from "../../../interfaces/auth.types.js";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.js";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.js";
import { DepartmentResponseDTO } from "../../../dto/hospital/department-response.dto.js";
import { QualificationResponseDTO } from "../../../dto/hospital/qualification-response.dto.js";
import { SpecializationResponseDTO } from "../../../dto/hospital/specialization-response.dto.js";

export interface DoctorAuthResponse extends AuthTokens {
    user: DoctorResponseDTO;
}

export interface IDoctorAuthService {
    registerDoctor(data: DoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO>;
    loginDoctor(data: LoginDTO): Promise<DoctorAuthResponse>;
    getAvailableHospitals(page: number, limit: number, search: string): Promise<{ hospitals: HospitalResponseDTO[]; total: number; totalPages: number; }>;
    getHospitalDepartments(hospitalId: string): Promise<DepartmentResponseDTO[]>;
    getHospitalQualifications(hospitalId: string): Promise<QualificationResponseDTO[]>;
    getHospitalSpecializations(hospitalId: string, departmentId?: string): Promise<SpecializationResponseDTO[]>;
}