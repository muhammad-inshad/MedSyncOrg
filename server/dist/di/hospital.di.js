import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { DoctorManagementController } from "../controllers/hospital/doctor/implementations/doctor.management.controller.js";
import { DoctorManagementService } from "../services/hospital/doctor/implementations/doctor.management.service.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { DoctorModel } from "../models/doctor.model.js";
import { PatientManagementController } from "../controllers/hospital/patient/implementations/patient.management.controller.js";
import { PatientManagementService } from "../services/hospital/patient/implementations/patient.management.service.js";
import { UserRepository } from "../repositories/patient/user.repository.js";
import { Patient } from "../models/Patient.model.js";
import { HospitalAuthService } from "../services/auth/hospital/hospital.auth.service.js";
import { HospitalAuthController } from "../controllers/auth/hospital/hospital.auth.controller.js";
import { HospitalMapper } from "../mappers/hospital.mapper.js";
import { DoctorMapper } from "../mappers/doctor.mapper.js";
import { DoctorLeaveMapper } from "../mappers/doctor-leave.mapper.js";
import { PatientMapper } from "../mappers/patient.mapper.js";
import { SubscriptionMapper } from "../mappers/subscription.mapper.js";
import { TokenService } from "../services/token/token.service.js";
import { HospitalService } from "../services/hospital/hospital/implementations/hospital.service.js";
import { HospitalController } from "../controllers/hospital/hospital/implementation/hospital.controller.js";
import { HospitalAuthMiddleware } from "../middleware/hospital.auth.middleware.js";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.js";
import { patientContainer } from "./patient.di.js";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.js";
import DepartmentModel from "../models/department.model.js";
import { LeaveRepository } from "../repositories/leave/leave.repository.js";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.js";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.js";
import { HospitalSubscriptionService } from "../services/hospital/subscription/implementation/subscription.service.js";
import { HospitalSubscriptionController } from "../controllers/hospital/subscription/implementation/subscription.controller.js";
import { QualificationService } from "../services/hospital/qualification/implementations/qualification.service.js";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.js";
import QualificationModel from "../models/qualification.model.js";
import { QualificationMapper } from "../mappers/qualification.mapper.js";
import { SpecializationService } from "../services/hospital/specialization/implementations/specialization.service.js";
import { SpecializationMapper } from "../mappers/specialization.mapper.js";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.js";
import { Dashbord } from '../controllers/hospital/hospital/implementation/dashbord.controller.js';
import { DashbordService } from "../services/hospital/hospital/implementations/dashbord.service.js";
import { SalaryrequestRepository } from "../repositories/salaryhike/salaryhike.repository.js";
import { SalaryRequestModel } from "../models/SalaryRequest.model.js";
import { DoctorSalaryservice } from "../services/hospital/doctor/implementations/doctor.salary.service.js";
import { DoctorSalaryController } from "../controllers/hospital/doctor/implementations/doctor.salary.controller.js";
import { HospitalDoctorConfigRepository } from "../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.js";
import { WalletRepository } from "../repositories/wallet/wallet.repository.js";
import { Wallet } from "../models/wallet.model.js";
import { AppointmentMapper } from "../mappers/appointment.mapper.js";
export const hospitalContainer = () => {
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const userRepo = new UserRepository(Patient);
    const tokenService = new TokenService();
    const doctorRepo = new DoctorRepository(DoctorModel);
    const doctorMapper = new DoctorMapper();
    const doctorLeaveMapper = new DoctorLeaveMapper();
    const patientMapper = new PatientMapper();
    const departmentRepo = new DepartmentRepository(DepartmentModel);
    const leaveRepo = new LeaveRepository();
    const appointmentRepo = new AppointmentRepository();
    const subscriptionRepo = new SubscriptionRepository();
    const subscriptionMapper = new SubscriptionMapper();
    const qualificationRepo = new QualificationRepository(QualificationModel);
    const qualificationMapper = new QualificationMapper();
    const specializationRepo = new SpecializationRepository();
    const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();
    const specializationMapper = new SpecializationMapper();
    const salaryRequestRepo = new SalaryrequestRepository(SalaryRequestModel);
    const doctorSalaryService = new DoctorSalaryservice(salaryRequestRepo, doctorRepo, HospitalDoctorConfigRepo);
    const doctorSalaryController = new DoctorSalaryController(doctorSalaryService);
    const WalletRepo = new WalletRepository(Wallet);
    const appoimentmapper = new AppointmentMapper();
    const hospitalMapper = new HospitalMapper();
    const hospitalSubscriptionService = new HospitalSubscriptionService(subscriptionRepo, hospitalRepo, doctorRepo, departmentRepo, userRepo, subscriptionMapper);
    const hospitalSubscriptionController = new HospitalSubscriptionController(hospitalSubscriptionService);
    const hospitalAuthService = new HospitalAuthService(hospitalRepo, tokenService, hospitalMapper);
    const hospitalAuthController = new HospitalAuthController(hospitalAuthService);
    const imageService = new CloudinaryImageService();
    const { patientService } = patientContainer();
    const hospitalService = new HospitalService(hospitalRepo, hospitalMapper, imageService, patientService, doctorRepo, departmentRepo, userRepo, subscriptionRepo);
    const hospitalController = new HospitalController(hospitalService);
    // Doctor management: only doctor toggle/accept/reject/revision
    const doctorManagementService = new DoctorManagementService(doctorRepo, doctorMapper, departmentRepo, leaveRepo, hospitalSubscriptionService, doctorLeaveMapper, specializationRepo, qualificationRepo);
    const doctorManagement = new DoctorManagementController(doctorManagementService);
    const patientManagementService = new PatientManagementService(userRepo, patientMapper, appointmentRepo, hospitalSubscriptionService);
    const patientManagement = new PatientManagementController(patientManagementService);
    const qualificationService = new QualificationService(qualificationRepo, imageService, qualificationMapper);
    const specializationService = new SpecializationService(specializationRepo, imageService, specializationMapper);
    const hospitalAuthMiddleware = new HospitalAuthMiddleware(tokenService, hospitalRepo);
    const dashbordservice = new DashbordService(doctorRepo, userRepo, departmentRepo, specializationRepo, qualificationRepo, WalletRepo, appointmentRepo, appoimentmapper, HospitalDoctorConfigRepo);
    const dashbordController = new Dashbord(dashbordservice);
    return {
        tokenService,
        hospitalAuthController,
        hospitalController,
        doctorManagement,
        doctorManagementService,
        hospitalRepo,
        patientManagement,
        patientManagementService,
        hospitalAuthMiddleware,
        hospitalSubscriptionController,
        qualificationService,
        specializationService,
        dashbordController,
        doctorSalaryController
    };
};
