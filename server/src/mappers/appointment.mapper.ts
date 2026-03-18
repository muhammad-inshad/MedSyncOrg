import { IMapper } from "../interfaces/mapper.interface.ts";
import { IAppointment } from "../models/appointment.ts";
import { AppointmentResponseDTO, AppointmentResponseSchema } from "../dto/appointment/appointment-response.dto.ts";

export class AppointmentMapper implements IMapper<IAppointment, AppointmentResponseDTO> {
    toDTO(appointment: IAppointment): AppointmentResponseDTO {
        const dto = {
            id: appointment._id.toString(),
            patientName: appointment.patientDetails.name,
            patientAge: appointment.patientDetails.age,
            patientPhone: appointment.patientDetails.phone,
            appointmentDate: appointment.appointmentDate instanceof Date 
                ? appointment.appointmentDate.toISOString() 
                : new Date(appointment.appointmentDate).toISOString(),
            visitTime: appointment.visitTime,
            status: appointment.status,
            mode: appointment.mode,
            tokenNumber: appointment.tokenNumber,
            prescription: appointment.prescription ? {
                medicines: appointment.prescription.medicines.map(m => ({
                    name: m.name,
                    dosage: m.dosage,
                    duration: m.duration,
                })),
                notes: appointment.prescription.notes,
                prescribedAt: appointment.prescription.prescribedAt instanceof Date 
                    ? appointment.prescription.prescribedAt.toISOString() 
                    : appointment.prescription.prescribedAt ? new Date(appointment.prescription.prescribedAt).toISOString() : undefined,
            } : undefined,
            bloodPressure: appointment.bloodPressure,
            heartRate: appointment.heartRate,
            weight: appointment.weight,
            createdAt: appointment.createdAt instanceof Date 
                ? appointment.createdAt.toISOString() 
                : new Date(appointment.createdAt).toISOString(),
            updatedAt: appointment.updatedAt instanceof Date 
                ? appointment.updatedAt.toISOString() 
                : new Date(appointment.updatedAt).toISOString(),
        };

        // Output Validation using Zod
        return AppointmentResponseSchema.parse(dto);
    }
}
