import { CreateDoctorSchedulePayload } from "../../../dto/doctor/doctor-response.dto.ts";
import { SlotResponseDTO } from "../../../dto/doctor/slot-response.dto.ts";

export interface ISlotMangement {
    createSchedule(data: CreateDoctorSchedulePayload): Promise<void>;                    
    getSchedules(
        doctorId: string, 
        page: number, 
        limit: number
    ): Promise<{ data: SlotResponseDTO[]; total: number }>;
    deleteSchedule(scheduleId: string, doctorId: string,status:boolean): Promise<void>;
}