import { DoctorAuthController } from "../controllers/auth/doctor/doctor.auth.controller.ts";
import { DoctorAuthService } from "../services/auth/doctor/doctor.auth.service.ts";
import DoctorController from "../controllers/doctor/doctor.controller.ts";
import { DoctorService } from "../services/doctor/implementations/doctor.service.ts";
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
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.ts";
import { AppointmentController } from "../controllers/doctor/appointment.controller.ts";
import { AppointmentService } from "../services/doctor/implementations/appointment.service.ts";
import { LeaveRepository } from "../repositories/leave/leave.repository.ts";
import { AppointmentMapper } from "../mappers/appointment.mapper.ts";
import { Consultation } from "../controllers/doctor/consultation.controller.ts";
import { DoctorLeaveMapper } from "../mappers/doctor-leave.mapper.ts";

import { DepartmentMapper } from "../mappers/department.mapper.ts";
import { QualificationMapper } from "../mappers/qualification.mapper.ts";
import { SpecializationMapper } from "../mappers/specialization.mapper.ts";

export const doctorContainer = () => {
  const doctorRepository = new DoctorRepository(DoctorModel);
  const tokenService = new TokenService();
  const hospitalRepo = new HospitalRepository(HospitalModel);
  const hospitalMapper = new HospitalMapper();
  const departmentRepo = new DepartmentRepository(DepartmentModel);
  const qualificationRepo = new QualificationRepository(QualificationModel);
  const specializationRepo = new SpecializationRepository();
  const leaveRepo = new LeaveRepository();
  const appointmentRepo = new AppointmentRepository();
  const appointmentMapper = new AppointmentMapper();

  const appointmentService = new AppointmentService(appointmentRepo, appointmentMapper);
  const consultation = new Consultation(appointmentService);

  const departmentMapper = new DepartmentMapper();
  const qualificationMapper = new QualificationMapper();
  const specializationMapper = new SpecializationMapper();

  const doctorMapper = new DoctorMapper();
  const doctorLeaveMapper = new DoctorLeaveMapper();

  const doctorService = new DoctorService(
    doctorRepository,
    tokenService,
    appointmentRepo,
    leaveRepo,
    doctorMapper,
    doctorLeaveMapper,
  );

  const doctorAuthService = new DoctorAuthService(
    doctorRepository,
    tokenService,
    doctorMapper,
    hospitalRepo,
    hospitalMapper,
    departmentRepo,
    qualificationRepo,
    specializationRepo,
    departmentMapper,
    qualificationMapper,
    specializationMapper
  );

  const doctorcontroller = new DoctorController(doctorService);
  const doctorAuthController = new DoctorAuthController(doctorAuthService);
  const doctorAuthMiddleware = new DoctorAuthMiddleware(tokenService, doctorRepository);

  const appoimentController = new AppointmentController(appointmentService);

  return {
    tokenService,
    doctorcontroller,
    doctorAuthController,
    doctorRepository,
    doctorAuthMiddleware,
    appoimentController,
    consultation,
    qualificationRepo
  };
};
