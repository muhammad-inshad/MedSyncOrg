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
            status: { $nin: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] }
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
            status: { $nin: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] }
        }).exec();
    }

    async findUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: Date
        }
    ): Promise<{ appointments: IAppointment[]; total: number }> {
        const { page, limit, search, date } = options;
        const skip = (page - 1) * limit;

        const query: any = {
            doctorId: doctorId,
            status: { $nin: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] }
        };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.appointmentDate = { $gte: today };
        }

        if (search) {
            query.$or = [
                { 'patientDetails.name': { $regex: search, $options: 'i' } },
                { 'patientDetails.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const [appointments, total] = await Promise.all([
            this.model.find(query)
                .populate('bookedBy')
                .sort({ appointmentDate: 1, visitTime: 1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(query).exec()
        ]);

        return { appointments, total };
    }

    async findDuplicate(
    doctorId: string, 
    date: Date, 
    patient: { name: string; age: number; email?: string }
): Promise<IAppointment | null> {
    return await this.model.findOne({
        doctorId,
        appointmentDate: date,
        "patientDetails.name": patient.name,
        "patientDetails.age": patient.age,
        "patientDetails.email": patient.email,
        status: { $ne: "cancelled" } 
    });
}
}
