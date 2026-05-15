import { LoginDTO, SignupDTO } from "../../../../dto/auth/signup.dto.js";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.js";
import { AuthResponse } from "../../../../interfaces/auth.types.js";
import { SuccessResponseDTO } from "../../../../dto/auth/success-response.dto.js";
import { TokenResponseDTO } from "../../../../dto/auth/token-response.dto.js";

export interface IPatientAuthService {
    signup(signupData: SignupDTO): Promise<PatientResponseDTO>
    login(data: LoginDTO): Promise<AuthResponse>;
    resetPassword(email: string, password: string, role: string): Promise<SuccessResponseDTO>;
    refreshAccessToken(refreshToken: string): Promise<TokenResponseDTO>;
}
