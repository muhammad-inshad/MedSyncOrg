import { BaseRepository } from "../IBase/BaseRepository.ts";
import { IAppointment, AppointmentModel, AppointmentStatus } from "../../models/appointment.ts";
import { IAppointmentRepository } from "./appointment.repository.interface.ts";

export class AppointmentRepository extends BaseRepository<IAppointment> implements IAppointmentRepository {
    constructor() {
        super(AppointmentModel);
    }

    async findByDoctorAndDate(doctorId: string, date: Date): Promise<IAppointment[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await this.model.find({
            doctorId: doctorId,
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $nin: [AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED] }
        }).exec();
    }

    async countByDoctorAndDate(doctorId: string, date: Date): Promise<number> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return await this.model.countDocuments({
            doctorId: doctorId,
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $nin: [AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED] }
        }).exec();
    }
}
