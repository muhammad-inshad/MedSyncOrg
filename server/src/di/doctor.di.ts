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
import PrescriptionModel from "../models/prescription.model.ts";
import { DepartmentMapper } from "../mappers/department.mapper.ts";
import { QualificationMapper } from "../mappers/qualification.mapper.ts";
import { SpecializationMapper } from "../mappers/specialization.mapper.ts";
import { PrescriptionRepository } from "../repositories/Prescription/prescription.repository.ts";
import { DoctorSlotManagementController } from "../controllers/doctor/DoctorSlotManagement.controller.ts";
import { SlotMangementService } from "../services/doctor/implementations/SlotManagement.service.ts";
import { SlotMapper } from "../mappers/slot.mapper.ts";
import { SlotRepository } from "../repositories/slot/slot.repository.ts";
import { DoctorScheduleModel } from "../models/DoctorSlot.ts";
import { DoctorDashboardService } from "../services/doctor/implementations/doctorDashbord.service.ts";
import { SalaryrequestRepository } from "../repositories/salaryhike/salaryhike.repository.ts";
import { SalaryRequestModel } from "../models/SalaryRequest.model.ts";
import { DoctorDashboard } from "../controllers/doctor/doctorDashboard.controller.ts";
import { WalletRepository } from "../repositories/wallet/wallet.repository.ts";
import { Wallet } from "../models/wallet.model.ts";

import { HospitalDoctorConfigRepository } from "../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.ts";
import { PrescriptionMapper } from "../mappers/prescription.mapper.ts";

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
