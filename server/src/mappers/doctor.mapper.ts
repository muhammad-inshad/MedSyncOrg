import { IMapper } from "../interfaces/mapper.interface.js";
import { IDoctor } from "../models/doctor.model.js";
import { DoctorResponseDTO, DoctorResponseSchema } from "../dto/doctor/doctor-response.dto.js";
export class DoctorMapper implements IMapper<IDoctor, DoctorResponseDTO> {
    toDTO(doctor: IDoctor): DoctorResponseDTO {
        // Explicitly extract and convert values to match the DTO expectations
        const dto: DoctorResponseDTO = {
            id: doctor._id.toString(),
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            address: doctor.address,
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
            reviewStatus: doctor.reviewStatus as "pending" | "approved" | "revision" | "rejected",
            reapplyDate: doctor.reapplyDate,
            rejectionReason: doctor.rejectionReason,
            salary:doctor.salary,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
        };

        return DoctorResponseSchema.parse(dto);
    }
}