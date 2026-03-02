
import { IPatient } from "../models/Patient.model.ts";
import { IHospital } from "../models/hospital.model.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { PatientResponseDTO } from "../dto/patient/patient-response.dto.ts";
import { DoctorResponseDTO } from "../dto/doctor/doctor-response.dto.ts";
import { HospitalResponseDTO } from "../dto/hospital/hospital-response.dto.ts";
import { SuperAdminResponseDTO } from "../dto/superAdmin/superAdmin-response.dto.ts";




export type UnifiedUser = IPatient | IHospital | IDoctor | PatientResponseDTO | DoctorResponseDTO | HospitalResponseDTO | SuperAdminResponseDTO;

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