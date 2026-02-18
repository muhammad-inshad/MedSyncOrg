import { LoginDTO, loginResponseDTO, PatientResponseDTO, SignupDTO } from "../../../dto/auth/signup.dto.ts";
import { AuthResponse } from "../../../interfaces/auth.types.ts";

export interface IPatientAuthService {
    signup(signupData: SignupDTO): Promise<PatientResponseDTO>
    login(data: LoginDTO): Promise<AuthResponse>;
    resetPassword(email: string, password: string, role: string): Promise<{ success: boolean; message: string }>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
}
