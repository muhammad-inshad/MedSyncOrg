import { IDoctorLeave } from "../../models/doctorLeave.model.js";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.js";

export interface ILeaveRepository extends IBaseRepository<IDoctorLeave> {
    findDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: IDoctorLeave[]; total: number; page: number; limit: number }>;

    findHospitalLeaves(options: {
        hospitalId: string;
        page: number;
        limit: number;
        search?: string;
        date?: Date;
    }): Promise<{ data: IDoctorLeave[]; total: number; page: number; limit: number }>;

    updateStatus(id: string, status: 'approved' | 'rejected', rejectedReason?: string): Promise<IDoctorLeave | null>;
}
