import { IHospital } from "../models/hospital.model.js";
import { KycHospitalResponseDTO, KycHospitalResponseSchema } from "../dto/superAdmin/kyc/kyc-hospital-response.dto.js";

export class KycHospitalMapper {
    toDTO(hospital: IHospital): KycHospitalResponseDTO {
        const dto = {
            id: hospital._id.toString(),
            hospitalName: hospital.hospitalName,
            email: hospital.email,
            phone: hospital.phone,
            since: hospital.since,
            licence: hospital.licence,
            address: hospital.address,
            reviewStatus: hospital.reviewStatus,
            createdAt: hospital.createdAt,
        };
        return KycHospitalResponseSchema.parse(dto);
    }
}
