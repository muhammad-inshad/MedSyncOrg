import { MESSAGES } from "../../../../constants/messages.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { IHospitalService } from "../interfaces/hospital.services.interfaces.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { HospitalMapper } from "../../../../mappers/hospital.mapper.ts";
import { IHospital } from "../../../../models/hospital.model.ts";

export class HospitalService implements IHospitalService {
    constructor(
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _hospitalMapper: HospitalMapper
    ) { }

    async getHospitalProfile(hospitalId: string): Promise<HospitalResponseDTO> {
        const hospital = await this._hospitalRepo.findById(hospitalId);

        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.ADMIN.NOT_FOUND);
        }

        return this._hospitalMapper.toDTO(hospital!);
    }

    async updateHospitalStatusReapply(hospitalId: string): Promise<HospitalResponseDTO|null> {
        const updatedHospital = await this._hospitalRepo.update(hospitalId, {
            reviewStatus: "pending",
            rejectionReason: undefined
        } as Partial<IHospital>);
        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }

    async updateHospital(hospitalId: string, hospitalData: Partial<IHospital>): Promise<HospitalResponseDTO|null> {
        const updatedHospital = await this._hospitalRepo.update(hospitalId, hospitalData);
        return updatedHospital ? this._hospitalMapper.toDTO(updatedHospital) : null;
    }
}