import { AppointmentResponseSchema } from "../dto/appointment/appointment-response.dto.js";
export class AppointmentMapper {
    toDTO(appointment) {
        const doc = appointment.doctorId;
        const patient = appointment.bookedBy;
        const dto = {
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
            rejectionReason: appointment?.rejectionReason,
            bloodPressure: appointment.bloodPressure,
            heartRate: appointment.heartRate,
            weight: appointment.weight,
            cancelReason: appointment.cancelReason || null,
            session: appointment.session || null,
            createdAt: appointment.createdAt instanceof Date
                ? appointment.createdAt.toISOString()
                : new Date(appointment.createdAt).toISOString(),
            updatedAt: appointment.updatedAt instanceof Date
                ? appointment.updatedAt.toISOString()
                : new Date(appointment.updatedAt).toISOString(),
        };
        return AppointmentResponseSchema.parse(dto);
    }
}
