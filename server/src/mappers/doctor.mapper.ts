import { IMapper } from "../interfaces/mapper.interface.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { DoctorResponseDTO, DoctorResponseSchema } from "../dto/doctor/doctor-response.dto.ts";
export class DoctorMapper implements IMapper<IDoctor, DoctorResponseDTO> {
    toDTO(doctor: IDoctor): DoctorResponseDTO {
        // Explicitly extract and convert values to match the DTO expectations
        const dto: DoctorResponseDTO = {
            id: doctor._id.toString(),
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            address: doctor.address,
            // Ensure department and specialization are strings if they come as ObjectIds
            specialization: doctor.specialization?.toString() || "",
            qualification: doctor.qualification,
            experience: doctor.experience,
            department: doctor.department?.toString() || "",
            hospital_id: doctor.hospital_id ? doctor.hospital_id.toString() : null,
            about: doctor.about || "",
            licence: doctor.licence || "",
            profileImage: doctor.profileImage || "",
            rating: Number(doctor.rating) || 0,
            reviewCount: Number(doctor.reviewCount) || 0,
            isActive: Boolean(doctor.isActive),
            isAccountVerified: Boolean(doctor.isAccountVerified),
            walletBalance: Number(doctor.walletBalance) || 0,
            reviewStatus: doctor.reviewStatus as "pending" | "approved" | "revision" | "rejected",
            reapplyDate: doctor.reapplyDate,
            rejectionReason: doctor.rejectionReason,
            availableSlots: Array.isArray(doctor.availableSlots) ? doctor.availableSlots : [],
            consultationTime: {
                start: doctor.consultationTime?.start || "",
                end: doctor.consultationTime?.end || "",
            },
            payment: {
                type: (doctor.payment?.type as "commission" | "fixed") || "fixed",
                commissionPercentage: doctor.payment?.commissionPercentage ?? null,
                fixedSalary: doctor.payment?.fixedSalary || 0,
                payoutCycle: (doctor.payment?.payoutCycle as "weekly" | "monthly") || "monthly",
                patientsPerDayLimit: doctor.payment?.patientsPerDayLimit || 0,
            },
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
        };

        return DoctorResponseSchema.parse(dto);
    }
}