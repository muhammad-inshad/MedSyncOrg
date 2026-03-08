import { IDoctorLeave } from "../../models/doctorLeave.model.ts";
import { IBaseRepository } from "../IBase/IBaseRepository.interface.ts";

export interface ILeaveRepository extends IBaseRepository<IDoctorLeave> {
    findDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: IDoctorLeave[]; total: number; page: number; limit: number }>;
}
