import { IMapper } from "../interfaces/mapper.interface.ts";
import { IAppointment } from "../models/appointment.ts";
import { AppointmentResponseDTO, AppointmentResponseSchema } from "../dto/appointment/appointment-response.dto.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { IPatient } from "../models/Patient.model.ts";

export class AppointmentMapper implements IMapper<IAppointment, AppointmentResponseDTO> {
    toDTO(appointment: IAppointment): AppointmentResponseDTO {
        const doc = appointment.doctorId as unknown as IDoctor;
        const patient = appointment.bookedBy as unknown as IPatient;

        const dto: AppointmentResponseDTO = {
            id: appointment._id.toString(),
            patientName: appointment.patientDetails.name,
            patientAge: appointment.patientDetails.age,
            patientPhone: appointment.patientDetails.phone,
            patientEmail: appointment.patientDetails.email || null,
            patientAddress: appointment.patientDetails.address || null,
            patientImage: patient?.image || null,

            doctorId: doc?._id ? doc._id.toString() : appointment.doctorId?.toString() || "",
            doctorName: doc?.name || "Unknown Doctor",
            doctorProfileImage: doc?.profileImage || null,
            doctorSpecialization: doc?.specialization || "General Medicine",
            doctorDepartment: doc?.department || "General",

            appointmentDate: appointment.appointmentDate instanceof Date
                ? appointment.appointmentDate.toISOString()
                : new Date(appointment.appointmentDate).toISOString(),
            visitTime: appointment.visitTime || null,
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
                    : appointment.prescription.prescribedAt
                        ? new Date(appointment.prescription.prescribedAt).toISOString()
                        : undefined,
            } : undefined,

            bloodPressure: appointment.bloodPressure,
            heartRate: appointment.heartRate,
            weight: appointment.weight,
            cancelReason: appointment.cancelReason || null,

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