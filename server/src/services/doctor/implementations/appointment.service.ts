import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IAppointments } from "../interfaces/appointment.service.interfaces.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";

export class AppointmentService implements IAppointments {
    constructor(private readonly _appointmentRepo: IAppointmentRepository) { }

    async getUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: string;
        }
    ) {
        const { page, limit, search, date } = options;

        const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
            page,
            limit,
            search,
            date: date ? new Date(date) : undefined
        });

        return res;
    }
}