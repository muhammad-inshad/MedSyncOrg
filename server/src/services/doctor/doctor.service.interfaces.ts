import { UpdateDoctorDTO } from "../../dto/doctor/doctor-response.dto.ts";
import { IDoctor } from "../../models/doctor.model.ts";

export interface IDoctorService {

    getDoctorProfile(doctorId: string): Promise<unknown>;
    updateDoctorProfile(doctorId: string, updateData: UpdateDoctorDTO, doctorFile?: Express.Multer.File): Promise<IDoctor | null>;
    reapply(doctorId: string): Promise<unknown>;
}