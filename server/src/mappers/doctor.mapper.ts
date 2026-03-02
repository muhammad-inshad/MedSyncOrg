import { IMapper } from "../interfaces/mapper.interface.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { DoctorResponseDTO } from "../dto/doctor/doctor-response.dto.ts";

export class DoctorMapper implements IMapper<IDoctor, DoctorResponseDTO> {
    toDTO(doctor: IDoctor): DoctorResponseDTO {
        return {
            id: doctor._id.toString(),
            _id: doctor._id.toString(),
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            address: doctor.address,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experience: doctor.experience,
            department: doctor.department,
            hospital_id: doctor.hospital_id?.toString(),
            about: doctor.about,
            licence: doctor.licence,
            profileImage: doctor.profileImage,
            rating: doctor.rating || 0,
            reviewCount: doctor.reviewCount || 0,
            isActive: doctor.isActive,
            isAccountVerified: doctor.isAccountVerified,
            walletBalance: doctor.walletBalance || 0,
            reviewStatus: doctor.reviewStatus,
            reapplyDate: doctor.reapplyDate,
            rejectionReason: doctor.rejectionReason,
            availableSlots: doctor.availableSlots || [],
            consultationTime: {
                start: doctor.consultationTime?.start || "",
                end: doctor.consultationTime?.end || "",
            },
            payment: {
                type: doctor.payment?.type || "fixed",
                commissionPercentage: doctor.payment?.commissionPercentage,
                fixedSalary: doctor.payment?.fixedSalary || 0,
                payoutCycle: doctor.payment?.payoutCycle || "monthly",
                patientsPerDayLimit: doctor.payment?.patientsPerDayLimit || 0,
            },
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
        };
    }
}
