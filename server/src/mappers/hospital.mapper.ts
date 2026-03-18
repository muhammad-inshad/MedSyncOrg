import { IMapper } from "../interfaces/mapper.interface.ts";
import { IHospital } from "../models/hospital.model.ts";
import { HospitalResponseDTO, HospitalResponseSchema } from "../dto/hospital/hospital-response.dto.ts";

export class HospitalMapper implements IMapper<IHospital, HospitalResponseDTO> {
    toDTO(
        hospital: IHospital, 
        limits?: HospitalResponseDTO['subscription']['limits'],
        currentCounts?: HospitalResponseDTO['currentCounts']
    ): HospitalResponseDTO {
        const dto = {
            id: hospital._id.toString(),
            hospitalName: hospital.hospitalName,
            logo: hospital.logo,
            address: hospital.address,
            isActive: hospital.isActive,
            autoDisabled: hospital.autoDisabled,
            email: hospital.email,
            phone: hospital.phone,
            since: hospital.since,
            pincode: hospital.pincode,
            about: hospital.about,
            licence: hospital.licence,
            images: hospital.images || {
                landscape: [],
                medicalTeam: [],
                patientCare: [],
                services: [],
            },
            income: hospital.income || 0,
            reviewStatus: hospital.reviewStatus,
            reapplyDate: hospital.reapplyDate,
            rejectionReason: hospital.rejectionReason,
            subscription: {
                plan: (hospital.subscription?.plan as "free" | "basic" | "premium") || "free",
                amount: hospital.subscription?.amount || 0,
                status: hospital.subscription?.status || "active",
                startDate: hospital.subscription?.startDate,
                endDate: hospital.subscription?.endDate,
                limits: limits,
            },
            currentCounts: currentCounts,
            createdAt: hospital.createdAt,
            updatedAt: hospital.updatedAt,
        };

        // Output Validation using Zod
        return HospitalResponseSchema.parse(dto);
    }
}
