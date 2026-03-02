import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { IHospital } from "../../../../models/hospital.model.ts";

export interface IHospitalManagementResult {
    data: HospitalResponseDTO[];
    total: number;
    page: number;
    limit: number;
}

export interface ISuperAdminHospitalService {
    hospitalManagement(options: { page: number; limit: number; search?: string; isActive?: boolean }): Promise<IHospitalManagementResult>;
    setActive(id: string, isActive: boolean): Promise<HospitalResponseDTO & { message: string }>;
    updateHospitalStatus(id: string, status: string, reason?: string): Promise<HospitalResponseDTO | null>;
    addHospital(data: Partial<IHospital>, files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }): Promise<HospitalResponseDTO>;
    editHospital(id: string, updateData: Partial<IHospital>, files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }): Promise<HospitalResponseDTO | null>;
}
