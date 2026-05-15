import { LoginDTO } from "../../../dto/auth/signup.dto.js";
import { HospitalUploadFiles } from "../../../types/hospital.type.js";
import { AuthResponse } from "../../../interfaces/auth.types.js";
import { HospitalResponseDTO } from "../../../dto/hospital/hospital-response.dto.js";
import { IHospital } from "../../../models/hospital.model.js";

export interface IHospitalAuthService {
    signup(hospitalData: Partial<IHospital>, files: HospitalUploadFiles): Promise<{ hospital: HospitalResponseDTO }>;
    loginHospital(loginData: LoginDTO): Promise<AuthResponse>;
}
