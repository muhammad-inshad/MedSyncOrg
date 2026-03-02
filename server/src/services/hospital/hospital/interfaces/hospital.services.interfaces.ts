import { HospitalResponseDTO } from "../../../../dto/hospital/hospital-response.dto.ts";
import { IHospital } from "../../../../models/hospital.model.ts";

export interface IHospitalService {
    getHospitalProfile(hospitalId: string): Promise<HospitalResponseDTO>;
    updateHospitalStatusReapply(hospitalId: string): Promise<HospitalResponseDTO | null>;
    updateHospital(hospitalId: string, hospitalData: Partial<IHospital>): Promise<HospitalResponseDTO | null>;
}