import { IPaginationResult, IDoctorListOptions } from "../../../../types/hospital.types.ts";
import { DoctorDTO } from "../../../../dto/auth/signup.dto.ts";
import { DoctorUploadFiles } from "../../../../types/doctor.types.ts";
import { DoctorResponseDTO, UpdateDoctorDTO } from "../../../../dto/doctor/doctor-response.dto.ts";

export interface IDoctorManagementService {
    getAllDoctors(options: IDoctorListOptions): Promise<IPaginationResult<DoctorResponseDTO>>;
    doctorsToggle(id: string): Promise<DoctorResponseDTO | null>;
    acceptDoctor(id: string): Promise<DoctorResponseDTO | null>;
    rejectDoctor(id: string): Promise<DoctorResponseDTO | null>;
    requestRevisionDoctor(id: string): Promise<DoctorResponseDTO | null>;
    registerDoctor(data: DoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO>;
    updateDoctor(id: string, data: UpdateDoctorDTO, files: DoctorUploadFiles): Promise<DoctorResponseDTO | null>;
}
