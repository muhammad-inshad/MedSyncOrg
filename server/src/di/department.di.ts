import { DepartmentManagementController } from "../controllers/hospital/department/implementation/department.controller.ts";
import { DepartmentService } from "../services/hospital/department/implementations/department.service.ts";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.ts";
import DepartmentModel from "../models/department.model.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";

import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";
import { HospitalSubscriptionService } from "../services/hospital/subscription/implementation/subscription.service.ts";
import { DepartmentMapper } from "../mappers/department.mapper.ts";
import { SubscriptionMapper } from "../mappers/subscription.mapper.ts";

export const departmentContiner = () => {
    const departmentRepo = new DepartmentRepository(DepartmentModel);
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const subscriptionRepo = new SubscriptionRepository();
    const doctorRepo = new DoctorRepository(DoctorModel);
    const userRepo = new UserRepository(Patient);
    const subscriptionMapper = new SubscriptionMapper();

    const subscriptionService = new HospitalSubscriptionService(
        subscriptionRepo,
        hospitalRepo,
        doctorRepo,
        departmentRepo,
        userRepo,
        subscriptionMapper
    );

    const imageService = new CloudinaryImageService();
    const departmentMapper = new DepartmentMapper();
    const departmentService = new DepartmentService(departmentRepo, imageService, subscriptionService, departmentMapper);
    const departmentManagement = new DepartmentManagementController(departmentService);

    return {
        departmentManagement
    };
};