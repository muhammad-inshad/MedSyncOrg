import { UpdateDoctorDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { IDoctor } from "../../../models/doctor.model.ts";

export interface IDoctorService {

    getDoctorProfile(doctorId: string): Promise<unknown>;
    updateDoctorProfile(doctorId: string, updateData: UpdateDoctorDTO): Promise<IDoctor | null>;
    reapply(doctorId: string): Promise<unknown>;
    applyLeave(doctorId: string, leaveData: { startDate: Date; endDate: Date; leaveSession?: "morning" | "afternoon" | "evening" | "night"; reason?: string; photo?: string | Express.Multer.File }): Promise<unknown>;
    getDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: any[]; total: number; page: number; limit: number }>;
}