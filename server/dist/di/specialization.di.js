import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.js";
import { SpecializationService } from "../services/hospital/specialization/implementations/specialization.service.js";
import { SpecializationManagementController } from "../controllers/hospital/specialization/implementation/specialization.controller.js";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.js";
import { SpecializationMapper } from "../mappers/specialization.mapper.js";
export const specializationContainer = () => {
    const specializationRepo = new SpecializationRepository();
    const specilizationMaper = new SpecializationMapper();
    const imageService = new CloudinaryImageService();
    const specializationService = new SpecializationService(specializationRepo, imageService, specilizationMaper);
    const specializationManagement = new SpecializationManagementController(specializationService);
    return {
        specializationManagement
    };
};
