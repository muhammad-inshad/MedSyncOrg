import { IMapper } from "../interfaces/mapper.interface.ts";
import { IHospital } from "../models/hospital.model.ts";
import { HospitalResponseDTO } from "../dto/hospital/hospital-response.dto.ts";

export class HospitalMapper implements IMapper<IHospital, HospitalResponseDTO> {
    toDTO(hospital: IHospital): HospitalResponseDTO {
        return {
            id: hospital._id.toString(),
            _id: hospital._id.toString(),
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
            income: hospital.income || 0,
            reviewStatus: hospital.reviewStatus,
            reapplyDate: hospital.reapplyDate,
            rejectionReason: hospital.rejectionReason,
            subscription: {
                plan: hospital.subscription?.plan || "free",
                amount: hospital.subscription?.amount || 0,
                status: hospital.subscription?.status || "active",
                startDate: hospital.subscription?.startDate,
                endDate: hospital.subscription?.endDate,
            },
            createdAt: hospital.createdAt,
            updatedAt: hospital.updatedAt,
        };
    }
}
