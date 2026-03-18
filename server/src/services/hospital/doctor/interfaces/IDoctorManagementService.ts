import { IPaginationResult, IDoctorListOptions } from "../../../../types/hospital.types.ts";
import { DoctorDTO } from "../../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../../types/doctor.types.ts";
import { DoctorResponseDTO, UpdateDoctorDTO } from "../../../../dto/doctor/doctor-response.dto.ts";
import { DoctorLeaveResponseDTO } from "../../../../dto/doctor/doctor-leave-response.dto.ts";

export interface IDoctorManagementService {
    getAllDoctors(options: IDoctorListOptions): Promise<IPaginationResult<DoctorResponseDTO>>;
    doctorsToggle(id: string): Promise<DoctorResponseDTO | null>;
    acceptDoctor(id: string): Promise<DoctorResponseDTO | null>;
    rejectDoctor(id: string, reason: string): Promise<DoctorResponseDTO | null>;
    requestRevisionDoctor(id: string, reason: string): Promise<DoctorResponseDTO | null>;
    registerDoctor(data: DoctorDTO, files: DoctorUploadFiles, hospital_id: string): Promise<DoctorResponseDTO>;
    updateDoctor(id: string, data: UpdateDoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO | null>;
    getLeaveDoctors(options: {
        hospitalId: string;
        page: number;
        limit: number;
        search?: string;
        date?: Date;
    }): Promise<{ data: DoctorLeaveResponseDTO[]; total: number; page: number; limit: number }>;
    updateLeaveStatus(leaveId: string, status: 'approved' | 'rejected', reason?: string): Promise<DoctorLeaveResponseDTO | null>;
}
