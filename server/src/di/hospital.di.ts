import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { DoctorManagementController } from "../controllers/hospital/doctor/implementations/doctor.management.controller.ts";
import { DoctorManagementService } from "../services/hospital/doctor/implementations/doctor.management.service.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { PatientManagementController } from "../controllers/hospital/patient/implementations/patient.management.controller.ts";
import { PatientManagementService } from "../services/hospital/patient/implementations/patient.management.service.ts";
import { UserRepository } from "../repositories/patient/user.repository.ts";
import { Patient } from "../models/Patient.model.ts";
import { HospitalAuthService } from "../services/auth/hospital/hospital.auth.service.ts";
import { HospitalAuthController } from "../controllers/auth/hospital/hospital.auth.controller.ts";
import { HospitalMapper } from "../mappers/hospital.mapper.ts";
import { DoctorMapper } from "../mappers/doctor.mapper.ts";
import { DoctorLeaveMapper } from "../mappers/doctor-leave.mapper.ts";
import { PatientMapper } from "../mappers/patient.mapper.ts";
import { SubscriptionMapper } from "../mappers/subscription.mapper.ts";
import { TokenService } from "../services/token/token.service.ts";
import { HospitalService } from "../services/hospital/hospital/implementations/hospital.service.ts";
import { HospitalController } from "../controllers/hospital/hospital/implementation/hospital.controller.ts";
import { HospitalAuthMiddleware } from "../middleware/hospital.auth.middleware.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";
import { patientContainer } from "./patient.di.ts";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.ts";
import DepartmentModel from "../models/department.model.ts";
import { LeaveRepository } from "../repositories/leave/leave.repository.ts";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.ts";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.ts";
import { HospitalSubscriptionService } from "../services/hospital/subscription/implementation/subscription.service.ts";
import { HospitalSubscriptionController } from "../controllers/hospital/subscription/implementation/subscription.controller.ts";
import { QualificationService } from "../services/hospital/qualification/implementations/qualification.service.ts";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.ts";
import QualificationModel from "../models/qualification.model.ts";
import { QualificationMapper } from "../mappers/qualification.mapper.ts";
import { SpecializationService } from "../services/hospital/specialization/implementations/specialization.service.ts";
import { SpecializationMapper } from "../mappers/specialization.mapper.ts";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.ts";
import { Dashbord } from '../controllers/hospital/hospital/implementation/dashbord.controller.ts';
import { DashbordService } from "../services/hospital/hospital/implementations/dashbord.service.ts";

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
    const specializationMapper = new SpecializationMapper();

    const hospitalMapper = new HospitalMapper();

    const hospitalSubscriptionService = new HospitalSubscriptionService(
        subscriptionRepo,
        hospitalRepo,
        doctorRepo,
        departmentRepo,
        userRepo,
        subscriptionMapper
    );
    const hospitalSubscriptionController = new HospitalSubscriptionController(hospitalSubscriptionService);

    const hospitalAuthService = new HospitalAuthService(
        hospitalRepo,
        tokenService,
        hospitalMapper
    );
    const hospitalAuthController = new HospitalAuthController(hospitalAuthService);
    const imageService = new CloudinaryImageService();
    const { patientService } = patientContainer();
    const hospitalService = new HospitalService(
        hospitalRepo, 
        hospitalMapper, 
        imageService, 
        patientService,
        doctorRepo,
        departmentRepo,
        userRepo,
        subscriptionRepo
    );
    const hospitalController = new HospitalController(hospitalService);

    // Doctor management: only doctor toggle/accept/reject/revision
    const doctorManagementService = new DoctorManagementService(
        doctorRepo,
        doctorMapper,
        departmentRepo,
        leaveRepo,
        hospitalSubscriptionService,
        doctorLeaveMapper,
        specializationRepo,
       qualificationRepo
    );
    const doctorManagement = new DoctorManagementController(
        doctorManagementService
    );

    const patientManagementService = new PatientManagementService(
        userRepo,
        patientMapper,
        appointmentRepo,
        hospitalSubscriptionService
    );
    const patientManagement = new PatientManagementController(
        patientManagementService
    );

    const qualificationService = new QualificationService(
        qualificationRepo,
        imageService,
        qualificationMapper
    );

    const specializationService = new SpecializationService(
        specializationRepo,
        imageService,
        specializationMapper
    );

    const hospitalAuthMiddleware = new HospitalAuthMiddleware(
        tokenService,
        hospitalRepo
    );
  const dashbordservice = new DashbordService(doctorRepo, userRepo, departmentRepo, specializationRepo, qualificationRepo);
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
        dashbordController
    };
}
