import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.ts";
import { SpecializationService } from "../services/hospital/specialization/implementations/specialization.service.ts";
import { SpecializationManagementController } from "../controllers/hospital/specialization/implementation/specialization.controller.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";
import { SpecializationMapper } from "../mappers/specialization.mapper.ts";

export const specializationContainer = () => {
    const specializationRepo = new SpecializationRepository();
    const specilizationMaper=new SpecializationMapper()
    const imageService = new CloudinaryImageService();
    const specializationService = new SpecializationService(specializationRepo, imageService,specilizationMaper);
    const specializationManagement = new SpecializationManagementController(specializationService);

    return {
        specializationManagement
    };
};
