import { IQualification } from "../../../../models/qualification.model.ts";
import { QualificationResponseDTO } from "../../../../dto/hospital/qualification-response.dto.ts";

export interface IQualificationService {
    getQualifications(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: QualificationResponseDTO[]; total: number; page: number; limit: number }>;
    createQualification(hospitalId: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<QualificationResponseDTO>;
    updateQualification(id: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<QualificationResponseDTO | null>;
    toggleStatus(id: string): Promise<QualificationResponseDTO | null>;
}
