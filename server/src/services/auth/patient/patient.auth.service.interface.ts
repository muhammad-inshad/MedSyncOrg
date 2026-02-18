import { LoginDTO, loginResponseDTO, PatientResponseDTO, SignupDTO } from "../../../dto/auth/signup.dto.ts";

export interface IPatientAuthService {
     signup(signupData: SignupDTO): Promise<PatientResponseDTO>
    login(data: LoginDTO): Promise<{ user: PatientResponseDTO; accessToken: string; refreshToken: string }>;
    resetPassword(email: string, password: string, role: string): Promise<{ success: boolean; message: string }>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
}
