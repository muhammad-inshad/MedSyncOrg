import Qualification from "../models/qualification.model.js";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.js";
import { QualificationService } from "../services/hospital/qualification/implementations/qualification.service.js";
import { QualificationManagementController } from "../controllers/hospital/qualification/implementation/qualification.controller.js";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.js";
import { QualificationMapper } from "../mappers/qualification.mapper.js";

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
