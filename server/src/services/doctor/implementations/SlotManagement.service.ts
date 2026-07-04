import mongoose from "mongoose";
import { CreateDoctorSchedulePayload } from "../../../dto/doctor/doctor-response.dto.ts";
import { SlotMapper } from "../../../mappers/slot.mapper.ts";
import { ISlotRepository } from "../../../repositories/slot/slot.repository.interface.ts";
import { ISlotMangement } from "../interfaces/slotMangement.service.interfaces.ts";
import { SlotResponseDTO } from "../../../dto/doctor/slot-response.dto.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";

export class SlotMangementService implements ISlotMangement {
    constructor(
        private readonly _slotrepo: ISlotRepository,
        private readonly _slotmapper:SlotMapper,
        private readonly _appointementrepo: IAppointmentRepository
    ) {}

async createSchedule(data: CreateDoctorSchedulePayload): Promise<void> {
  if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
    ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
  }

   const existingSchedule =await this._slotrepo.findExistingSchedule(data.doctorId,data.daysOfWeek,data.session)
   if (existingSchedule) {
    const cheack=existingSchedule.includes(data.session)
     if(existingSchedule.length>0&&cheack){
  ApiResponse.throwError(
    HttpStatusCode.CONFLICT,
    `Schedule already created for the selected days and session on ${existingSchedule.join(",")}`
  );
}
}
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  const totalMinutes = endTotal - startTotal;

  if (totalMinutes <= 0) {
    ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid time range");
  }

  const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);

  const payload = {
    ...data,
    tokenPerDay, 
    isActive: false,
    doctorId: new mongoose.Types.ObjectId(data.doctorId),
  };

  await this._slotrepo.create(payload);
}

 async getSchedules(doctorId: string,page: number = 1,limit: number = 10): Promise<{ data:SlotResponseDTO[]; total: number }> {
  const result = await this._slotrepo.findWithPagination({
    page,
    limit,
    filter: {
      doctorId: new mongoose.Types.ObjectId(doctorId),
    },
  });
   const mappedData = result.data.map((slot) =>
    this._slotmapper.toDTO(slot)
  );
  return {
    data: mappedData,
    total: result.total,
  };
}

    async updateSchedule(scheduleId: string, data: CreateDoctorSchedulePayload): Promise<void> {
        if (!data.doctorId || !data.daysOfWeek?.length || !data.session) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required fields");
        }

        const [startH, startM] = data.startTime.split(":").map(Number);
        const [endH, endM] = data.endTime.split(":").map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        const totalMinutes = endTotal - startTotal;

        if (totalMinutes <= 0) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid time range");
        }

        const tokenPerDay = Math.floor(totalMinutes / data.slotDuration);

        const payload = {
            ...data,
            doctorId: new mongoose.Types.ObjectId(data.doctorId),
            tokenPerDay,
        };

        const updated = await this._slotrepo.update(scheduleId, payload);
        if (!updated) {
            throw new Error("Update failed");
        }
    }

    async deleteSchedule(scheduleId: string, doctorId: string, status: boolean): Promise<void> {
        const isActive = !status;
        
        if (!isActive) {
            const schedule = await this._slotrepo.findById(scheduleId);
            if (schedule) {
                const { appointments } = await this._appointementrepo.findUpcomingAppointments(doctorId, { page: 1, limit: 1000 });
                
                const hasExistingAppointments = appointments.some(app => {
                    const appDay = new Date(app.appointmentDate).getUTCDay();
                    return app.session === schedule.session && schedule.daysOfWeek.includes(appDay) && app.status !== "cancelled" && app.status !== "completed";
                });
                
                if (hasExistingAppointments) {
                    ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Cannot deactivate schedule with existing appointments");
                }
            }
        }

        const updated = await this._slotrepo.update(scheduleId, {
            isActive,
        });

        if (!updated) {
            throw new Error("Update failed");
        }
    }
}