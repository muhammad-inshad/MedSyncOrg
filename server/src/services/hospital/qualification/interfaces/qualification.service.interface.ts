import { IQualification } from "../../../../models/qualification.model.ts";

export interface IQualificationService {
    getQualifications(hospitalId: string, page: number, limit: number, search?: string): Promise<{ data: IQualification[]; total: number; page: number; limit: number }>;
    createQualification(hospitalId: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<IQualification>;
    updateQualification(id: string, data: Partial<IQualification>, file?: Express.Multer.File): Promise<IQualification | null>;
    toggleStatus(id: string): Promise<IQualification | null>;
}
