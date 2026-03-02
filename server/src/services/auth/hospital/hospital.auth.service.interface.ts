import { IHospital } from "../../../models/hospital.model.ts";
import { LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { HospitalUploadFiles } from "../../../types/hospital.type.ts";
import { AuthResponse } from "../../../interfaces/auth.types.ts";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.ts";

export interface IHospitalAuthService {
    signup(hospitalData: Partial<IHospital>, files: HospitalUploadFiles): Promise<{ hospital: HospitalResponseDTO }>;
    loginHospital(loginData: LoginDTO): Promise<AuthResponse>;
}
