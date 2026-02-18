
import { IPatient } from "../models/Patient.model.ts";
import { IAdmin } from "../models/admin.model.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { DoctorDTO, PatientResponseDTO } from "../dto/auth/signup.dto.ts";

export interface ITokenPayload {
    userId: string;
    email: string;
    role: string;
}

export interface ITokenService {
    generateAccessToken(payload: ITokenPayload): string;
    generateRefreshToken(payload: ITokenPayload): string;
    verifyRefreshToken(token: string): ITokenPayload;
}

export type UnifiedUser = IPatient | IAdmin | IDoctor | PatientResponseDTO | DoctorDTO;

export interface AuthError {
    status: number;
    message: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
    user: UnifiedUser;
}