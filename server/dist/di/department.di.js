import { DepartmentManagementController } from "../controllers/hospital/department/implementation/department.controller.js";
import { DepartmentService } from "../services/hospital/department/implementations/department.service.js";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.js";
import DepartmentModel from "../models/department.model.js";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.js";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.js";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { DoctorModel } from "../models/doctor.model.js";
import { UserRepository } from "../repositories/patient/user.repository.js";
import { Patient } from "../models/Patient.model.js";
import { HospitalSubscriptionService } from "../services/hospital/subscription/implementation/subscription.service.js";
import { DepartmentMapper } from "../mappers/department.mapper.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";
export const departmentContiner = () => {
    const departmentRepo = new DepartmentRepository(DepartmentModel);
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const subscriptionRepo = new SubscriptionRepository();
    const doctorRepo = new DoctorRepository(DoctorModel);
    const userRepo = new UserRepository(Patient);
    const subscriptionMapper = new SubscriptionMapper();
    const subscriptionService = new HospitalSubscriptionService(subscriptionRepo, hospitalRepo, doctorRepo, departmentRepo, userRepo, subscriptionMapper);
    const imageService = new CloudinaryImageService();
    const departmentMapper = new DepartmentMapper();
    const departmentService = new DepartmentService(departmentRepo, imageService, subscriptionService, departmentMapper);
    const departmentManagement = new DepartmentManagementController(departmentService);
    return {
        departmentManagement
    };
};
