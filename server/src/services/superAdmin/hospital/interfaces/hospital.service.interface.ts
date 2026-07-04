import { HospitalResponseDTO, HospitalStatusUpdateResponseDTO, CreateHospitalDTO, UpdateHospitalDTO } from "../../../../dto/hospital/hospital-response.dto.ts";

export interface IHospitalManagementResult {
    data: HospitalResponseDTO[];
    total: number;
    page: number;
    limit: number;
}

export interface ISuperAdminHospitalService {
    hospitalManagement(options: { page: number; limit: number; search?: string; isActive?: boolean }): Promise<IHospitalManagementResult>;
    setActive(id: string, isActive: boolean): Promise<HospitalStatusUpdateResponseDTO>;
    updateHospitalStatus(id: string, status: string, reason?: string): Promise<HospitalResponseDTO | null>;
    addHospital(data: CreateHospitalDTO, files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }): Promise<HospitalResponseDTO>;
    editHospital(id: string, updateData: UpdateHospitalDTO, files?: { logo?: Express.Multer.File; licence?: Express.Multer.File }): Promise<HospitalResponseDTO | null>;
}
