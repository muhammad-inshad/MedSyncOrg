import { LoginDTO, PatientResponseDTO, SignupDTO } from "../../dto/auth/signup.dto.ts";
import { UnifiedUser } from "../../interfaces/auth.types.ts";

export interface IAuthService {
    signup(signupData: SignupDTO): Promise<PatientResponseDTO>
    login(data: LoginDTO): Promise<{ user: PatientResponseDTO | UnifiedUser; accessToken: string; refreshToken: string }>;
    resetPassword(email: string, password: string, role: string): Promise<{ success: boolean; message: string }>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
}
