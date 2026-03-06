import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { AuthTokens } from "../../../interfaces/auth.types.ts";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.ts";

export interface DoctorAuthResponse extends AuthTokens {
    user: DoctorResponseDTO;
}

export interface IDoctorAuthService {
    registerDoctor(data: DoctorDTO, files: DoctorUploadFiles): Promise<IDoctor>;
    loginDoctor(data: LoginDTO): Promise<DoctorAuthResponse>;
    getAvailableHospitals( page: number, limit: number,  search: string): Promise<{ hospitals: HospitalResponseDTO[];  total: number; totalPages: number;}>;
}