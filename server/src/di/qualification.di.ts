import Qualification from "../models/qualification.model.ts";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.ts";
import { QualificationService } from "../services/hospital/qualification/implementations/qualification.service.ts";
import { QualificationManagementController } from "../controllers/hospital/qualification/implementation/qualification.controller.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";

export const qualificationContainer = () => {
    const qualificationRepository = new QualificationRepository(Qualification);
    const imageService = new CloudinaryImageService();
    const qualificationService = new QualificationService(qualificationRepository, imageService);
    const qualificationManagement = new QualificationManagementController(qualificationService);

    return {
        qualificationManagement
    };
};
