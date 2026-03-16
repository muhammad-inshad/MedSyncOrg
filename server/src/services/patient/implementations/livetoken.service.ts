import { Igettoken, ILiveTokenResponse } from "../interfaces/livetoken.service.interfaces.ts";
import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { Types } from "mongoose";

export class LiveTokenService implements Igettoken {
    constructor(private readonly _appointmentRepo: IAppointmentRepository) {}

    async getPatientLiveToken(patientId: string, doctorId?: string): Promise<ILiveTokenResponse | null> {
        let targetDoctorId = doctorId;

        if (!targetDoctorId) {
            targetDoctorId = await this._appointmentRepo.findDoctorByPatientToday(patientId) || undefined;
        }

        if (!targetDoctorId) {
            return null;
        }

        const liveAppointment = await this._appointmentRepo.findLiveToken(targetDoctorId);

        // Also get the patient's own appointment for today to show their token number
        const patientAppointments = await this._appointmentRepo.findPatientAppointmentsToday(patientId);
        const patientAppointment = patientAppointments.find((app) => {
            const docId = (app.doctorId as any)?._id
                ? (app.doctorId as any)._id.toString()
                : app.doctorId.toString();
            return docId === targetDoctorId;
        });

        if (!patientAppointment) {
            return null;
        }

        const doctor = patientAppointment.doctorId as unknown as IDoctor;

        return {
            currentLiveToken: liveAppointment ? liveAppointment.tokenNumber : 0,
            patientTokenNumber: patientAppointment.tokenNumber,
            doctorName: doctor.name || "Unknown Doctor",
            appointmentId: (patientAppointment._id as Types.ObjectId).toString(),
        };
    }
}
