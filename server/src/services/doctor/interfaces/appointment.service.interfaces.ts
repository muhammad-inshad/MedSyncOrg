import { IAppointment } from "../../../models/appointment.ts";

export interface IAppointments {
    getUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: string;
        }
    ): Promise<{ appointments: IAppointment[]; total: number }>;
}