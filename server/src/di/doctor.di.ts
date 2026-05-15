import { DoctorAuthController } from "../controllers/auth/doctor/doctor.auth.controller.js";
import { DoctorAuthService } from "../services/auth/doctor/doctor.auth.service.js";
import DoctorController from "../controllers/doctor/doctor.controller.js";
import { DoctorService } from "../services/doctor/implementations/doctor.service.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { TokenService } from "../services/token/token.service.js";
import { DoctorModel } from "../models/doctor.model.js";
import { DoctorMapper } from "../mappers/doctor.mapper.js";
import { DoctorAuthMiddleware } from "../middleware/doctor.auth.middleware.js";
import { HospitalMapper } from "../mappers/hospital.mapper.js";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.js";
import DepartmentModel from "../models/department.model.js";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.js";
import QualificationModel from "../models/qualification.model.js";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.js";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.js";
import { AppointmentController } from "../controllers/doctor/appointment.controller.js";
import { AppointmentService } from "../services/doctor/implementations/appointment.service.js";
import { LeaveRepository } from "../repositories/leave/leave.repository.js";
import { AppointmentMapper } from "../mappers/appointment.mapper.js";
import { Consultation } from "../controllers/doctor/consultation.controller.js";
import { DoctorLeaveMapper } from "../mappers/doctor-leave.mapper.js";
import PrescriptionModel from "../models/prescription.model.js";
import { DepartmentMapper } from "../mappers/department.mapper.js";
import { QualificationMapper } from "../mappers/qualification.mapper.js";
import { SpecializationMapper } from "../mappers/specialization.mapper.js";
import { PrescriptionRepository } from "../repositories/Prescription/prescription.repository.js";
import { DoctorSlotManagementController } from "../controllers/doctor/DoctorSlotManagement.controller.js";
import { SlotMangementService } from "../services/doctor/implementations/SlotManagement.service.js";
import { SlotMapper } from "../mappers/slot.mapper.js";
import { SlotRepository } from "../repositories/slot/slot.repository.js";
import { DoctorScheduleModel } from "../models/DoctorSlot.js";
import { DoctorDashboardService } from "../services/doctor/implementations/doctorDashbord.service.js";
import { SalaryrequestRepository } from "../repositories/salaryhike/salaryhike.repository.js";
import { SalaryRequestModel } from "../models/SalaryRequest.model.js";
import { DoctorDashboard } from "../controllers/doctor/doctorDashboard.controller.js";
import { WalletRepository } from "../repositories/wallet/wallet.repository.js";
import { Wallet } from "../models/wallet.model.js";

import { HospitalDoctorConfigRepository } from "../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.js";
import { PrescriptionMapper } from "../mappers/prescription.mapper.js";

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
  const prescriptionMapper = new PrescriptionMapper();
  const slotmapper=new SlotMapper()
   const slotRepo=new SlotRepository(DoctorScheduleModel)
  const prescriptionRepo = new PrescriptionRepository(PrescriptionModel);
  const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();

  const slotservice=new SlotMangementService(slotRepo,slotmapper)
  const slotcontroller=new DoctorSlotManagementController(slotservice)
  const departmentMapper = new DepartmentMapper();
  const qualificationMapper = new QualificationMapper();
  const specializationMapper = new SpecializationMapper();
  const WalletRepo = new WalletRepository(Wallet);
  const doctordashbordrepository=new SalaryrequestRepository(SalaryRequestModel)
  const doctordashbordservice=new DoctorDashboardService(doctordashbordrepository,doctorRepository,WalletRepo)
  const doctorDashboard=new DoctorDashboard(doctordashbordservice)
 
  const appointmentService = new AppointmentService(appointmentRepo, appointmentMapper, prescriptionRepo,HospitalDoctorConfigRepo,WalletRepo,prescriptionMapper);

  const consultation = new Consultation(appointmentService);

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
    qualificationRepo,
    slotcontroller,
    doctorDashboard
  };
};
