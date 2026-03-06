import { ISpecialization } from "../../../../models/specialization.model.ts";

export interface ISpecializationService {
    getSpecializations(
        hospitalId: string,
        params: { page: number; limit: number; search?: string }
    ): Promise<{ data: ISpecialization[]; total: number; limit: number; page: number }>;

    createSpecialization(
        hospitalId: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<ISpecialization>;

    updateSpecialization(
        id: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<ISpecialization | null>;

    toggleStatus(id: string): Promise<ISpecialization | null>;
}
