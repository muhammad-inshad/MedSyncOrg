import { IHospital } from "../models/hospital.model.ts";

export interface IDashboardStats {
    doctorCount: number;
    patientCount: number;
    activeDoctorCount: number;
}

export interface IPaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface IHospitalLoginResponse {
    hospital: Partial<IHospital>;
    token: string;
}

export interface IDoctorFilter {
    hospital_id?: string;
    reviewStatus?: string;
    licence?: object;
}

export interface IPatientFilter {
    hospital_id?: string;
}

export interface IDoctorListOptions {
    page: number;
    limit: number;
    search?: string;
    filter?: IDoctorFilter;
}
