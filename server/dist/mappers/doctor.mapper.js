import { DoctorResponseSchema } from "../dto/doctor/doctor-response.dto.js";
export class DoctorMapper {
    toDTO(doctor) {
        // Explicitly extract and convert values to match the DTO expectations
        const dto = {
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
            reviewStatus: doctor.reviewStatus,
            reapplyDate: doctor.reapplyDate,
            rejectionReason: doctor.rejectionReason,
            salary: doctor.salary,
            createdAt: doctor.createdAt,
            updatedAt: doctor.updatedAt,
        };
        return DoctorResponseSchema.parse(dto);
    }
}
