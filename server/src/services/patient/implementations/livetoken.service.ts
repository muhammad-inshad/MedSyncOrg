import { Igettoken } from "../interfaces/livetoken.service.interfaces.ts";
import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { LiveTokenResponseDTO } from "../../../dto/patient/livetoken-response.dto.ts";
import { LiveTokenMapper } from "../../../mappers/livetoken.mapper.ts";
import { Types } from "mongoose";

export class LiveTokenService implements Igettoken {
    constructor(
        private readonly _appointmentRepo: IAppointmentRepository,
        private readonly _liveTokenMapper: LiveTokenMapper
    ) {}

    async getPatientLiveToken(patientId: string, doctorId?: string): Promise<LiveTokenResponseDTO | null> {
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
            const docId = app.doctorId instanceof Types.ObjectId
                ? app.doctorId.toString()
                : app.doctorId._id.toString();
            return docId === targetDoctorId;
        });

        if (!patientAppointment) {
            return null;
        }

        const doctor = patientAppointment.doctorId as IDoctor;

        const data = {
            currentLiveToken: liveAppointment ? liveAppointment.tokenNumber : 0,
            patientTokenNumber: patientAppointment.tokenNumber,
            doctorName: doctor.name || "Unknown Doctor",
            appointmentId: (patientAppointment._id as Types.ObjectId).toString(),
        };

        return this._liveTokenMapper.toDTO(data);
    }
}
