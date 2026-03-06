import { DoctorAuthController } from "../controllers/auth/doctor/doctor.auth.controller.ts";
import { DoctorAuthService } from "../services/auth/doctor/doctor.auth.service.ts";
import DoctorController from "../controllers/doctor/doctor.controller.ts";
import { DoctorService } from "../services/doctor/doctor.service.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { TokenService } from "../services/token/token.service.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { DoctorMapper } from "../mappers/doctor.mapper.ts";
import { DoctorAuthMiddleware } from "../middleware/doctor.auth.middleware.ts";
import { HospitalMapper } from "../mappers/hospital.mapper.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.ts";
import DepartmentModel from "../models/department.model.ts";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.ts";
import QualificationModel from "../models/qualification.model.ts";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.ts";
import SpecializationModel from "../models/specialization.model.ts";

export const doctorContainer = () => {
  const doctorRepository = new DoctorRepository(DoctorModel);
  const tokenService = new TokenService();
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const hospitalMapper = new HospitalMapper();
  const departmentRepo = new DepartmentRepository(DepartmentModel);
  const qualificationRepo = new QualificationRepository(QualificationModel);
  const specializationRepo = new SpecializationRepository();

  const doctorService = new DoctorService(
    doctorRepository,
    tokenService
  );

  const doctorMapper = new DoctorMapper();
  const doctorAuthService = new DoctorAuthService(
    doctorRepository,
    tokenService,
    doctorMapper,
    hospitalRepo,
    hospitalMapper,
    departmentRepo,
    qualificationRepo,
    specializationRepo
  );



  const doctorcontroller = new DoctorController(doctorService);
  const doctorAuthController = new DoctorAuthController(doctorAuthService);
  const doctorAuthMiddleware = new DoctorAuthMiddleware(tokenService, doctorRepository);

  return {
    tokenService,
    doctorcontroller,
    doctorAuthController,
    doctorRepository,
    doctorAuthMiddleware
  };
};
