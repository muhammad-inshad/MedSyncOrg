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
import { PatientMapper } from "../mappers/patient.mapper.ts";
import { TokenService } from "../services/token/token.service.ts";
import { HospitalService } from "../services/hospital/hospital/implementations/hospital.service.ts";
import { HospitalController } from "../controllers/hospital/hospital/implementation/hospital.controller.ts";
import { HospitalAuthMiddleware } from "../middleware/hospital.auth.middleware.ts";
import { CloudinaryImageService } from "../services/image/implementation/cloudinary.image.service.ts";

export const hospitalContainer = () => {
    const hospitalRepo = new HospitalRepository(HospitalModel);
    const userRepo = new UserRepository(Patient);
    const tokenService = new TokenService();
    const doctorRepo = new DoctorRepository(DoctorModel);
    const doctorMapper = new DoctorMapper();
    const patientMapper = new PatientMapper();

    const hospitalMapper = new HospitalMapper();
    const hospitalAuthService = new HospitalAuthService(
        hospitalRepo,
        tokenService,
        hospitalMapper
    );
    const hospitalAuthController = new HospitalAuthController(hospitalAuthService);

    // Hospital profile (getme)
    const imageService = new CloudinaryImageService();
    const hospitalService = new HospitalService(hospitalRepo, hospitalMapper, imageService);
    const hospitalController = new HospitalController(hospitalService);

    // Doctor management: only doctor toggle/accept/reject/revision
    const doctorManagementService = new DoctorManagementService(
        doctorRepo,
        doctorMapper
    );
    const doctorManagement = new DoctorManagementController(
        doctorManagementService
    );

    // Patient management: only patient toggle/signup
    const patientManagementService = new PatientManagementService(
        userRepo,
        patientMapper
    );
    const patientManagement = new PatientManagementController(
        patientManagementService
    );

    const hospitalAuthMiddleware = new HospitalAuthMiddleware(
        tokenService,
        hospitalRepo
    );
    return {
        tokenService,
        hospitalAuthController,
        hospitalController,
        doctorManagement,
        doctorManagementService,
        hospitalRepo,
        patientManagement,
        patientManagementService,
        hospitalAuthMiddleware
    };
};
