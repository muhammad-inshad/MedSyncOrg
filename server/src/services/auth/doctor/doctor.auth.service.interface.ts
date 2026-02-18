import { DoctorDTO, LoginDTO } from "../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../types/doctor.types.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { UnifiedUser } from "../../../interfaces/auth.types.ts";

export interface IDoctorAuthService {
    registerDoctor(data: DoctorDTO, files: DoctorUploadFiles): Promise<IDoctor>;
    loginDoctor(data: LoginDTO): Promise<{ user: any; accessToken: string; refreshToken: string }>;
}