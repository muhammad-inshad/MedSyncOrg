import { LoginDTO, SignupDTO } from "../../../../dto/auth/signup.dto.ts";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { AuthResponse } from "../../../../interfaces/auth.types.ts";
import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.ts";
import { TokenResponseDTO } from "../../../../dto/auth/token-response.dto.ts";

export interface IPatientAuthService {
    signup(signupData: SignupDTO): Promise<PatientResponseDTO>
    login(data: LoginDTO): Promise<AuthResponse>;
    resetPassword(email: string, password: string, role: string): Promise<SuccessResponseDTO>;
    refreshAccessToken(refreshToken: string): Promise<TokenResponseDTO>;
}
