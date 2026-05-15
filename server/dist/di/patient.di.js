import { UserRepository } from "../repositories/patient/user.repository.js";
import PatientController from "../controllers/patient/Patient.controller.js";
import { Patient } from "../models/Patient.model.js";
import { TokenService } from "../services/token/token.service.js";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.js";
import { HospitalModel } from "../models/hospital.model.js";
import { PatientAuthMiddleware } from "../middleware/patient.auth.middleware.js";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.js";
import DepartmentModel from "../models/department.model.js";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.js";
import { DoctorModel } from "../models/doctor.model.js";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.js";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.js";
import QualificationModel from "../models/qualification.model.js";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.js";
import { PatientService } from "../services/patient/implementations/patient.service.js";
import { LiveTokenService } from "../services/patient/implementations/livetoken.service.js";
import { LiveTokenMapper } from "../mappers/livetoken.mapper.js";
import { PatientMapper } from "../mappers/patient.mapper.js";
import { HospitalMapper } from "../mappers/hospital.mapper.js";
import { DoctorMapper } from "../mappers/doctor.mapper.js";
import { AppointmentMapper } from "../mappers/appointment.mapper.js";
import { PrescriptionMapper } from "../mappers/prescription.mapper.js";
import { WalletRepository } from "../repositories/wallet/wallet.repository.js";
import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.js";
import { Wallet } from "../models/wallet.model.js";
import { LiveTokenController } from "../controllers/patient/LiveToken.controller.js";
import { PrescriptionRepository } from "../repositories/Prescription/prescription.repository.js";
import PrescriptionModel from "../models/prescription.model.js";
import { SlotRepository } from "../repositories/slot/slot.repository.js";
import { DoctorScheduleModel } from "../models/DoctorSlot.js";
import { SlotMapper } from "../mappers/slot.mapper.js";
import { HospitalDoctorConfigRepository } from "../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.js";
export const patientContainer = () => {
    const tokenService = new TokenService();
    const userRepository = new UserRepository(Patient);
    const hospitalRepository = new HospitalRepository(HospitalModel);
    const departmentRepository = new DepartmentRepository(DepartmentModel);
    const doctorRepository = new DoctorRepository(DoctorModel);
    const appointmentRepository = new AppointmentRepository();
    const qualificationRepository = new QualificationRepository(QualificationModel);
    const specializationRepository = new SpecializationRepository();
    const subscriptionRepository = new SubscriptionRepository();
    const liveTokenMapper = new LiveTokenMapper();
    const patientMapper = new PatientMapper();
    const hospitalMapper = new HospitalMapper();
    const doctorMapper = new DoctorMapper();
    const walletRepository = new WalletRepository(Wallet);
    const appointmentMapper = new AppointmentMapper();
    const prescriptionMapper = new PrescriptionMapper();
    const priscriptionRepo = new PrescriptionRepository(PrescriptionModel);
    const slotReppo = new SlotRepository(DoctorScheduleModel);
    const slotmapper = new SlotMapper();
    const HospitalDoctorConfigRepo = new HospitalDoctorConfigRepository();
    const patientService = new PatientService(userRepository, hospitalRepository, departmentRepository, doctorRepository, appointmentRepository, qualificationRepository, specializationRepository, subscriptionRepository, patientMapper, hospitalMapper, doctorMapper, appointmentMapper, priscriptionRepo, prescriptionMapper, slotReppo, slotmapper, HospitalDoctorConfigRepo, walletRepository);
    const patientController = new PatientController(patientService);
    const patientAuthMiddleware = new PatientAuthMiddleware(tokenService, userRepository);
    const liveTokenService = new LiveTokenService(appointmentRepository, liveTokenMapper);
    const liveToken = new LiveTokenController(liveTokenService);
    return {
        tokenService,
        patientController,
        patientService,
        patientAuthMiddleware,
        liveToken,
    };
};
