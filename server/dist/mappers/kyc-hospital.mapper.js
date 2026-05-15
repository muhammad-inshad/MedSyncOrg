import { KycHospitalResponseSchema } from "../dto/superAdmin/kyc/kyc-hospital-response.dto.js";
export class KycHospitalMapper {
    toDTO(hospital) {
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
