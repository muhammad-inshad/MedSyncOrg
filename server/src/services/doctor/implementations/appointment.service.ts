import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IAppointments } from "../interfaces/appointment.service.interfaces.ts";
import { AppointmentStatus } from "../../../models/appointment.ts";
import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.ts";
import { IMapper } from "../../../interfaces/mapper.interface.ts";
import { IAppointment } from "../../../models/appointment.ts";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import {IPrescriptionRepository} from "../../../repositories/Prescription/prescription.repository.interface.ts";
export class AppointmentService implements IAppointments {
    constructor(
        private readonly _appointmentRepo: IAppointmentRepository,
        private readonly _appointmentMapper: IMapper<IAppointment, AppointmentResponseDTO>,
        private readonly _prescriptionRepo: IPrescriptionRepository
    ) { }
    

    async getUpcomingAppointments(
        doctorId: string,
        options: {
            page: number;
            limit: number;
            search?: string;
            date?: string;
        }
    ): Promise<{ appointments: AppointmentResponseDTO[]; total: number }> {
        const { page, limit, search, date } = options;
        console.log(date,"oooooooooooooooooooooooooo")
  
        const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
            page,
            limit,
            search,
            date: date ? new Date(date) : undefined
        });
console.log(res)
        return {
            appointments: res.appointments.map(app => this._appointmentMapper.toDTO(app)),
            total: res.total
        };
    }

    async getTodayConsultations(doctorId: string, options?: { page: number; limit: number }): Promise<{ appointments: AppointmentResponseDTO[]; total: number }> {
        const today = new Date();
        console.log(options)
        const res = await this._appointmentRepo.findByDoctorAndDate(doctorId, today, options);
        return {
            appointments: res.appointments.map(app => this._appointmentMapper.toDTO(app)),
            total: res.total
        };
    }

    async updateStatus(appointmentId: string, status: AppointmentStatus): Promise<AppointmentResponseDTO | null> {
        const updated = await this._appointmentRepo.update(appointmentId, { status });
        return updated ? this._appointmentMapper.toDTO(updated) : null;
    }
async savePrescription(
  appointmentId: string,
  prescriptionData: IPrescriptionData
): Promise<AppointmentResponseDTO | null> {

  const appointment = await this._appointmentRepo.findById(appointmentId);
  if (!appointment) return null;

  if (!appointment.patientDetails.email) {
    throw new Error("Patient email is required");
  }

  const prescriptionPayload = {
    hospital_id: appointment.hospitalId,
    patient_email: appointment.patientDetails.email, 
    doctor_id: appointment.doctorId,
    appointment_id: appointment._id,
    medicines: prescriptionData.medicines,
    notes: prescriptionData.notes,
  };

  const prescription = await this._prescriptionRepo.create(prescriptionPayload);
  if(!prescription){
    throw new Error("Failed to save prescription"); 
  }

  const updated = await this._appointmentRepo.update(appointmentId, {
    status: AppointmentStatus.COMPLETED,
  });

  return updated ? this._appointmentMapper.toDTO(updated) : null;
}

}