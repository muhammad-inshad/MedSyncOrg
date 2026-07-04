import { HospitalResponseDTO, UpdateHospitalDTO, selectedHospitalDto } from "../../../../dto/hospital/hospital-response.dto.ts";

export interface IHospitalService {
    getHospitalProfile(hospitalId: string): Promise<HospitalResponseDTO>;
    getSelectedHospital(hospitalId: string, page?: number, limit?: number, search?: string): Promise<selectedHospitalDto>;
    updateHospitalStatusReapply(hospitalId: string): Promise<HospitalResponseDTO | null>;
    updateHospital(hospitalId: string, hospitalData: UpdateHospitalDTO, files?: { [fieldname: string]: Express.Multer.File[] }): Promise<HospitalResponseDTO | null>;
}