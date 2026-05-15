
import { IPatient } from "../models/Patient.model.js";
import { IHospital } from "../models/hospital.model.js";
import { IDoctor } from "../models/doctor.model.js";
import { PatientResponseDTO } from "../dto/patient/patient-response.dto.js";
import { DoctorResponseDTO } from "../dto/doctor/doctor-response.dto.js";
import { HospitalResponseDTO } from "../dto/hospital/hospital-response.dto.js";
import { SuperAdminResponseDTO } from "../dto/superAdmin/superAdmin-response.dto.js";




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