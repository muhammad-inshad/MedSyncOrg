import { UserRepository } from "../repositories/patient/user.repository.ts";
import PatientController from "../controllers/patient/Patient.controller.ts";
import { Patient } from "../models/Patient.model.ts";
import { TokenService } from "../services/token/token.service.ts";
import { HospitalRepository } from "../repositories/hospital/hospital.repository.ts";
import { HospitalModel } from "../models/hospital.model.ts";
import { PatientAuthMiddleware } from "../middleware/patient.auth.middleware.ts";
import { DepartmentRepository } from "../repositories/hospital/implementation/department.repository.ts";
import DepartmentModel from "../models/department.model.ts";
import { DoctorRepository } from "../repositories/doctor/doctor.repository.ts";
import { DoctorModel } from "../models/doctor.model.ts";
import { AppointmentRepository } from "../repositories/appointment/appointment.repository.ts";
import { QualificationRepository } from "../repositories/hospital/implementation/qualification.repository.ts";
import QualificationModel from "../models/qualification.model.ts";
import { SpecializationRepository } from "../repositories/hospital/implementation/specialization.repository.ts";
import { PatientService } from "../services/patient/implementations/patient.service.ts";
import { LiveTokenService } from "../services/patient/implementations/livetoken.service.ts";
import { LiveTokenMapper } from "../mappers/livetoken.mapper.ts";
import { PatientMapper } from "../mappers/patient.mapper.ts";
import { HospitalMapper } from "../mappers/hospital.mapper.ts";
import { DoctorMapper } from "../mappers/doctor.mapper.ts";
import { AppointmentMapper } from "../mappers/appointment.mapper.ts";
import { PrescriptionMapper } from "../mappers/prescription.mapper.ts";

import { SubscriptionRepository } from "../repositories/superAdmin/subscription/implements/subscription.repository.ts";

import { LiveTokenController } from "../controllers/patient/LiveToken.controller.ts";
import { PrescriptionRepository } from "../repositories/Prescription/prescription.repository.ts";
import PrescriptionModel from "../models/prescription.model.ts";
import { SlotRepository } from "../repositories/slot/slot.repository.ts";
import { DoctorScheduleModel } from "../models/DoctorSlot.ts";
import { SlotMapper } from "../mappers/slot.mapper.ts";

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
  const appointmentMapper = new AppointmentMapper();
  const prescriptionMapper = new PrescriptionMapper();
  const priscriptionRepo= new PrescriptionRepository(PrescriptionModel);
  const slotReppo=new SlotRepository(DoctorScheduleModel)
  const slotmapper=new SlotMapper()
  const patientService = new PatientService(
    userRepository,
    hospitalRepository,
    departmentRepository,
    doctorRepository,
    appointmentRepository,
    qualificationRepository,
    specializationRepository,
    subscriptionRepository,
    patientMapper,
    hospitalMapper,
    doctorMapper,
    appointmentMapper,
    priscriptionRepo,
    prescriptionMapper,
    slotReppo,
    slotmapper
  );
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