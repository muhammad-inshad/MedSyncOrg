import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { AuthTokens } from "../../../interfaces/auth.types.ts";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.ts";
import { DepartmentResponseDTO } from "../../../dto/hospital/department-response.dto.ts";
import { QualificationResponseDTO } from "../../../dto/hospital/qualification-response.dto.ts";
import { SpecializationResponseDTO } from "../../../dto/hospital/specialization-response.dto.ts";

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