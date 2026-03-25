import Qualification from "../models/qualification.model.ts";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.ts";
import { QualificationService } from "../services/hospital/qualification/implementations/qualification.service.ts";
import { QualificationManagementController } from "../controllers/hospital/qualification/implementation/qualification.controller.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";
import { QualificationMapper } from "../mappers/qualification.mapper.ts";

export const qualificationContainer = () => {
    const qualificationRepository = new QualificationRepository(Qualification);
    const qualificationMapper = new QualificationMapper();
    const imageService = new CloudinaryImageService();
    const qualificationService = new QualificationService(qualificationRepository, imageService,qualificationMapper);
    const qualificationManagement = new QualificationManagementController(qualificationService);

    return {
        qualificationManagement
    };
};
