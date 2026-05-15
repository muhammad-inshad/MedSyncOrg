import { PrescriptionResponseSchema } from "../dto/patient/prescription-response.dto.js";
export class PrescriptionMapper {
    toDTO(prescription) {
        const doctor = prescription.doctor_id;
        const hospital = prescription.hospital_id;
        const dto = {
            id: prescription._id.toString(),
            patient_email: prescription.patient_email,
            doctor_id: {
                id: doctor._id?.toString() || prescription.doctor_id.toString(),
                name: doctor.name || "Unknown Doctor",
                profileImage: doctor.profileImage || "",
                specialization: doctor.specialization || "",
            },
            hospital_id: {
                id: hospital._id?.toString() || prescription.hospital_id.toString(),
                name: hospital.hospitalName || "Unknown Hospital",
                logo: hospital.logo || "",
                address: hospital.address || "",
            },
            appointment_id: prescription.appointment_id?.toString(),
            medicines: prescription.medicines.map(m => ({
                name: m.name,
                dosage: m.dosage,
                duration: m.duration,
            })),
            notes: prescription.notes,
            createdAt: prescription.createdAt,
            updatedAt: prescription.updatedAt,
        };
        return PrescriptionResponseSchema.parse(dto);
    }
}
