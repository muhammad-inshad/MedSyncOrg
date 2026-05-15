import { UpdateDoctorDTO, DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.js";
import { DoctorLeaveResponseDTO } from "../../../dto/doctor/doctor-leave-response.dto.js";

export interface IDoctorService {
    getDoctorProfile(doctorId: string): Promise<DoctorResponseDTO>;
    updateDoctorProfile(doctorId: string, updateData: UpdateDoctorDTO): Promise<DoctorResponseDTO>;
    reapply(doctorId: string): Promise<DoctorResponseDTO>;
    applyLeave(doctorId: string, leaveData: { startDate: Date; endDate: Date; leaveSession?: "morning" | "afternoon" | "evening" | "night"; reason?: string; photo?: string | Express.Multer.File }): Promise<DoctorLeaveResponseDTO>;
    getDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: DoctorLeaveResponseDTO[]; total: number; page: number; limit: number }>;
}