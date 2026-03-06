import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.ts";
import { SpecializationService } from "../services/hospital/specialization/implementations/specialization.service.ts";
import { SpecializationManagementController } from "../controllers/hospital/specialization/implementation/specialization.controller.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";

export const specializationContainer = () => {
    const specializationRepo = new SpecializationRepository();
    const imageService = new CloudinaryImageService();
    const specializationService = new SpecializationService(specializationRepo, imageService);
    const specializationManagement = new SpecializationManagementController(specializationService);

    return {
        specializationManagement
    };
};
