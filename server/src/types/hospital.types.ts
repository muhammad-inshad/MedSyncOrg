import { IHospital } from "../models/hospital.model.js";

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
    isActive?: boolean;
    hospital_id?: string;
    reviewStatus?: string;
    licence?: object;
}

export interface IDepartmentFilter {
    isActive?: boolean;
    hospital_id?: object;}

export interface IPatientFilter {
    hospital_id?: string;
      isActive?: boolean;
}

export interface IsubscriptionFilter {
      isActive?: boolean;
}

export interface IQualificationFilter {
    isActive?: boolean;
    hospital_id?: object;
}

export interface IDoctorListOptions {
    page: number;
    limit: number;
    search?: string;
    filter?: IDoctorFilter;
    status?: string; // 'all' | 'pending' | 'revision' | 'rejected'
}
