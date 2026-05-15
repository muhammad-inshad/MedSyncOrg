export class AppointmentService {
    constructor(_appointmentRepo, _appointmentMapper, _prescriptionRepo, _HospitalDoctorConfigRepo, _WalletRepo, prescriptionMapper) {
        this._appointmentRepo = _appointmentRepo;
        this._appointmentMapper = _appointmentMapper;
        this._prescriptionRepo = _prescriptionRepo;
        this._HospitalDoctorConfigRepo = _HospitalDoctorConfigRepo;
        this._WalletRepo = _WalletRepo;
        this.prescriptionMapper = prescriptionMapper;
    }
    async getUpcomingAppointments(doctorId, options) {
        const { page, limit, search, date } = options;
        const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
            page,
            limit,
            search,
            date: date ? new Date(date) : undefined
        });
        return {
            appointments: res.appointments.map(app => this._appointmentMapper.toDTO(app)),
            total: res.total
        };
    }
    async getTodayConsultations(doctorId, options) {
        const today = new Date();
        const dateString = today.toISOString().split("T")[0];
        const res = await this._appointmentRepo.findtodayconseltation(doctorId, dateString, options);
        return {
            appointments: res.appointments.map((app) => this._appointmentMapper.toDTO(app)),
            total: res.total,
        };
    }
    async updateStatus(appointmentId, status) {
        const appointment = await this._appointmentRepo.findById(appointmentId);
        if (!appointment) {
            throw new Error("Appointment not found");
        }
        const config = await this._HospitalDoctorConfigRepo.findOne({
            doctorId: appointment.doctorId,
            hospitalId: appointment.hospitalId,
        });
        if (!config) {
            throw new Error("Config not found");
        }
        const doctorAmount = config.doctorFee;
        const hospitalAmount = (doctorAmount * config.hospitalCommission) / 100;
        const findDoctrorWallet = await this._WalletRepo.findOne({
            ownerId: appointment.doctorId,
        });
        if (!findDoctrorWallet) {
            await this._WalletRepo.create({
                ownerId: appointment.doctorId,
            });
        }
        const findHospitalWallet = await this._WalletRepo.findOne({
            ownerId: appointment.hospitalId,
        });
        if (!findHospitalWallet) {
            await this._WalletRepo.create({
                ownerId: appointment.hospitalId,
            });
        }
        if (appointment.paymentstatus === "pending") {
            await this._WalletRepo.creditWallet(appointment.doctorId.toString(), doctorAmount);
            await this._WalletRepo.creditWallet(appointment.hospitalId.toString(), hospitalAmount);
        }
        else {
            await this._WalletRepo.debitWallet(appointment.hospitalId.toString(), doctorAmount);
            await this._WalletRepo.creditWallet(appointment.doctorId.toString(), doctorAmount);
        }
        const updated = await this._appointmentRepo.update(appointmentId, { status });
        return updated
            ? this._appointmentMapper.toDTO(updated)
            : null;
    }
    async savePrescription(appointmentId, prescriptionData) {
        const appointment = await this._appointmentRepo.findById(appointmentId);
        if (!appointment)
            return null;
        if (!appointment.patientDetails.email) {
            throw new Error("Patient email is required");
        }
        const doctorId = typeof appointment.doctorId === "object"
            ? appointment.doctorId._id
            : appointment.doctorId;
        const prescriptionPayload = {
            hospital_id: appointment.hospitalId,
            patient_email: appointment.patientDetails.email,
            doctor_id: doctorId,
            appointment_id: appointment._id,
            medicines: prescriptionData.medicines,
            notes: prescriptionData.notes,
        };
        const prescription = await this._prescriptionRepo.create(prescriptionPayload);
        if (!prescription) {
            throw new Error("Failed to save prescription");
        }
        const prescriptionDTO = this.prescriptionMapper.toDTO(prescription);
        return prescriptionDTO;
    }
}
