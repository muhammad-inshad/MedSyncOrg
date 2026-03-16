import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IAppointments } from "../interfaces/appointment.service.interfaces.ts";
import { IAppointment, AppointmentStatus } from "../../../models/appointment.ts";
import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.ts";

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
    ): Promise<{ appointments: IAppointment[]; total: number }> {
        const { page, limit, search, date } = options;

        const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
            page,
            limit,
            search,
            date: date ? new Date(date) : undefined
        });

        return res;
    }

    async getTodayConsultations(doctorId: string, options?: { page: number; limit: number }): Promise<{ appointments: IAppointment[]; total: number }> {
        const today = new Date();
        return await this._appointmentRepo.findByDoctorAndDate(doctorId, today, options);
    }

    async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<IAppointment | null> {
        return await this._appointmentRepo.update(appointmentId, { status });
    }

    async savePrescription(appointmentId: string, prescriptionData: IPrescriptionData): Promise<IAppointment | null> {
        return await this._appointmentRepo.update(appointmentId, {
            prescription: {
                ...prescriptionData,
                prescribedAt: new Date()
            },
            status: AppointmentStatus.COMPLETED
        });
    }


}