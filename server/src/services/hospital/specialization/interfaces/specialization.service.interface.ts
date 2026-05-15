import { ISpecialization } from "../../../../models/specialization.model.js";
import { SpecializationResponseDTO } from "../../../../dto/hospital/specialization-response.dto.js";

export interface ISpecializationService {
    getSpecializations(
        hospitalId: string,
        params: { page: number; limit: number; search?: string; filter?: "active" | "blocked" | undefined }
    ): Promise<{ data: SpecializationResponseDTO[]; total: number; limit: number; page: number }>;

    createSpecialization(
        hospitalId: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<SpecializationResponseDTO>;

    updateSpecialization(
        id: string,
        specializationData: Partial<ISpecialization>,
        file?: Express.Multer.File
    ): Promise<SpecializationResponseDTO | null>;

    toggleStatus(id: string): Promise<SpecializationResponseDTO | null>;
}
