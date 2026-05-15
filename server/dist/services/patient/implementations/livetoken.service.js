import { Types } from "mongoose";
export class LiveTokenService {
    constructor(_appointmentRepo, _liveTokenMapper) {
        this._appointmentRepo = _appointmentRepo;
        this._liveTokenMapper = _liveTokenMapper;
    }
    async getPatientLiveToken(patientId, doctorId) {
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
        const doctor = patientAppointment.doctorId;
        const data = {
            currentLiveToken: liveAppointment ? liveAppointment.tokenNumber : 0,
            patientTokenNumber: patientAppointment.tokenNumber,
            doctorName: doctor.name || "Unknown Doctor",
            appointmentId: patientAppointment._id.toString(),
        };
        return this._liveTokenMapper.toDTO(data);
    }
}
