import { IPatient } from "../../../models/Patient.model.ts";
import { IDepartment } from "../../../models/department.model.ts";
import { IPatientService } from "../interfaces/patient.service.interfaces.ts";
import { IUserRepository } from "../../../repositories/patient/user.repository.interface.ts";
import { IHospitalRepository } from "../../../repositories/hospital/hospital.repository.interface.ts";
import { IDepartmentRepository } from "../../../repositories/hospital/department.repository.interface.ts";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.ts";
import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IQualificationRepository } from "../../../repositories/hospital/qualification.repository.interface.ts";
import { ISpecializationRepository } from "../../../repositories/hospital/specialization.repository.interface.ts";
import { ISubscriptionRepository } from "../../../repositories/superAdmin/subscription/interfaces/subscription.repository.interface.ts";
import { HttpStatusCode } from "../../../constants/enums.ts";
import { MESSAGES } from "../../../constants/messages.ts";
import { ApiResponse } from "../../../utils/apiResponse.utils.ts";
import { IHospital } from "../../../models/hospital.model.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { IAppointment, AppointmentStatus } from "../../../models/appointment.ts";
import { IPaginationResult } from "../../../types/hospital.types.ts";
import bcrypt from "bcryptjs";
import { selectedHospitalDto, DepartmentResponseDTO, QualificationResponseDTO, SpecializationResponseDTO, HospitalResponseDTO, SelectedHospitalSchema } from "../../../dto/hospital/hospital-response.dto.ts";
import { PatientResponseDTO } from "../../../dto/patient/patient-response.dto.ts";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import { PatientMapper } from "../../../mappers/patient.mapper.ts";
import { HospitalMapper } from "../../../mappers/hospital.mapper.ts";
import { DoctorMapper } from "../../../mappers/doctor.mapper.ts";
import { AppointmentMapper } from "../../../mappers/appointment.mapper.ts";
import { Types } from "mongoose";
import { IPrescriptionRepository } from "../../../repositories/Prescription/prescription.repository.interface.ts";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper.ts";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.ts";

export class PatientService implements IPatientService {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _hospitalRepo: IHospitalRepository,
    private readonly _departmentRepo: IDepartmentRepository,
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _appointmentRepo: IAppointmentRepository,
    private readonly _qualificationRepo: IQualificationRepository,
    private readonly _specializationRepo: ISpecializationRepository,
    private readonly _subscriptionRepo: ISubscriptionRepository,
    private readonly _patientMapper: PatientMapper,
    private readonly _hospitalMapper: HospitalMapper,
    private readonly _doctorMapper: DoctorMapper,
    private readonly _appointmentMapper: AppointmentMapper,
    private readonly _priscriptionRepo: IPrescriptionRepository,
    private readonly _prescriptionMapper: PrescriptionMapper,
  ) {}

  async getProfile(userId: string): Promise<PatientResponseDTO | null> {
    const patient = await this._userRepo.findById(userId);
    if (!patient) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }
    return this._patientMapper.toDTO(patient!);
  }

  async updateProfile(id: string, data: Partial<IPatient>): Promise<PatientResponseDTO | null> {
    const updated = await this._userRepo.update(id, data);
    if (!updated) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }
    return this._patientMapper.toDTO(updated!);
  }

  async getAllPatient(query: { page: number; limit: number; search: string }): Promise<{ data: PatientResponseDTO[]; total: number }> {
    const result = await this._userRepo.findWithPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ["name", "email", "phone"]
    });
    return { 
      data: result.data.map(p => this._patientMapper.toDTO(p)), 
      total: result.total 
    };
  }

  async gethospitals(page: number, limit: number, search: string): Promise<IPaginationResult<HospitalResponseDTO>> {
    const result = await this._hospitalRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "address", "email"],
      filter: { isActive: true, reviewStatus: "approved" }
    });

    console.log(result)
    
    return {
      ...result,
      data: result.data.map(h => this._hospitalMapper.toDTO(h))
    } as IPaginationResult<HospitalResponseDTO>;
  }

  async changePassword(id: string, current: string, newP: string): Promise<void> {
    const patient = await this._userRepo.findByIdWithPassword(id);
    if (!patient) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(current, patient!.password);
    if (!isMatch) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Current password does not match");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newP, salt);
    await this._userRepo.update(id, { password: hashedPassword });
  }

  async selectedHospital(id: string, page: number = 1, limit: number = 6, search: string = ""): Promise<selectedHospitalDto> {
    
    const hospital = await this._hospitalRepo.findById(id);
    if (!hospital) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.ADMIN.NOT_FOUND);
    }

    const [departmentsResult, qualifications, specializations] = await Promise.all([
      this._departmentRepo.findByHospitalId(id, page, limit, search),
      this._qualificationRepo.findByHospitalId(id),
      this._specializationRepo.findByHospitalId(id)
    ]);

    const departmentsWithCounts = await Promise.all(
      departmentsResult.data.map(async (dept) => {
        const d = dept.toObject ? dept.toObject() : dept;
        const doctorCount = await this._doctorRepo.countByDepartment(id, d._id.toString());
        return {  
          ...d,
          _id: d._id.toString(),
          doctorCount
        };
      })
    );

    const formattedQualifications = qualifications.map((q) => {
      const obj = q.toObject ? q.toObject() : q;
      return {
        _id: obj._id.toString(),
        name: String(obj.name || ""),
        qualificationName: String(obj.qualificationName || obj.abbreviation || ""),
        description: obj.description || "",
        image: obj.image || ""
      };
    });

    const formattedSpecializations = specializations.map((s) => {
      const obj = s.toObject ? s.toObject() : s;
      return {
        _id: obj._id.toString(),
        name: String(obj.name || ""),
        description: obj.description || "",
        image: obj.image || "",
        department_id: obj.department_id.toString()
      };
    });

    const hospitalData = hospital!.toObject();

    const selectedHospitalData = {
      ...hospitalData,
      _id: hospitalData._id.toString(),
      departments: departmentsWithCounts,
      qualifications: formattedQualifications,
      specializations: formattedSpecializations,
      totalDepartments: departmentsResult.total,
      currentPage: page,
      totalPages: Math.ceil(departmentsResult.total / limit)
    };

    return SelectedHospitalSchema.parse(selectedHospitalData);
}

  async getDoctorDepartment(id: string, page: number, limit: number, search: string): Promise<IPaginationResult<DoctorResponseDTO>> {
    const result = await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "specialization"],
      filter: { department: id, isActive: true, reviewStatus: "approved" }
    });
    return {
      ...result,
      data: result.data.map(d => this._doctorMapper.toDTO(d))
    } as IPaginationResult<DoctorResponseDTO>;
  }

  async getDoctorById(id: string): Promise<DoctorResponseDTO> {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
    }
    return this._doctorMapper.toDTO(doctor!);
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<{ tokenInfo: { availableSlots: number; totalSlots: number; bookedTokens: number; maxTokens: number; status: "Available" | "Filling Fast" | "Fully Booked" } }> {
    const appointmentDate = new Date(date);
    const [doctor, bookedTokens] = await Promise.all([
      this._doctorRepo.findById(doctorId),
      this._appointmentRepo.countByDoctorAndDate(doctorId, appointmentDate)
    ]);

    if (!doctor) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
    }

    const maxTokens = doctor.payment?.patientsPerDayLimit || 20;
    const availableSlots = maxTokens - bookedTokens;

    let status: "Available" | "Filling Fast" | "Fully Booked" = "Available";
    if (bookedTokens >= maxTokens) {
      status = "Fully Booked";
    } else if (bookedTokens >= maxTokens * 0.8) {
      status = "Filling Fast";
    }

    return {
      tokenInfo: {
        availableSlots: availableSlots > 0 ? availableSlots : 0,
        totalSlots: maxTokens,
        bookedTokens,
        maxTokens,
        status
      }
    };
  }

  async bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void> {
    const { doctorId, appointmentDate, patientDetails } = data;
   
    if (!doctorId || !appointmentDate || !patientDetails) {
        console.error("[PatientService.bookAppointment] Error: Missing critical details:", { doctorId, appointmentDate, patientDetails });
        ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing appointment details");
    }

    const dateObj = new Date(appointmentDate!);

    const duplicate = await this._appointmentRepo.findDuplicate(doctorId!.toString(), dateObj, patientDetails!);
    if (duplicate) {
      ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.PATIENT.ALREADYBOOKED);
    }

    const count = await this._appointmentRepo.countByDoctorAndDate(doctorId!.toString(), dateObj);
    const tokenNumber = count + 1;
    
    const appointmentData: Partial<IAppointment> = { ...data };
    if (appointmentData.bloodPressure === "") delete appointmentData.bloodPressure;
    if (appointmentData.heartRate === "") delete appointmentData.heartRate;
    if (appointmentData.weight === "") delete appointmentData.weight;

    const result = await this._appointmentRepo.create({
      ...appointmentData,
      bookedBy: new Types.ObjectId(patientId),
      tokenNumber,
      status: AppointmentStatus.PENDING
    });
    console.log(`[PatientService.bookAppointment] SUCCESS! Appointment created with ID: ${result._id}`);
  }

  async checkDuplicateAppointment(doctorId: string, date: string, patient: { name: string; age: number; email?: string }): Promise<AppointmentResponseDTO | null> {
    const dateObj = new Date(date);
    const result = await this._appointmentRepo.findDuplicate(doctorId, dateObj, patient);
    return result ? this._appointmentMapper.toDTO(result) : null;
  }


  async getAppoimentHistory(patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: AppointmentResponseDTO[]; total: number }> {
    const result = await this._appointmentRepo.findPatientAppointments(patientId, query);
    return { 
      data: result.appointments.map(a => this._appointmentMapper.toDTO(a)), 
      total: result.total 
    };
  }

  async getTodayAppointments(patientId: string): Promise<AppointmentResponseDTO[]> {
    const result = await this._appointmentRepo.findPatientAppointmentsToday(patientId);
    return result.map(a => this._appointmentMapper.toDTO(a));
  }

  async cancelAppointment(data: { id: string; reason: string }): Promise<void> {
    const updated = await this._appointmentRepo.update(data.id, {
      status: AppointmentStatus.CANCELLED,
      cancelReason: data.reason
    });
    if (!updated) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Appointment not found");
    }
  }

  async checkAppointmentStatus(sessionId: string): Promise<boolean> {
    const appointment = await this._appointmentRepo.findByPaymentId(sessionId);
    return !!appointment;
  }

getPrescriptions = async (
  patientId: string,
  query: { page: number; limit: number; search: string }
): Promise<{ data: PrescriptionResponseDTO[]; total: number; page: number; limit: number }> => {

    const patient = await this._userRepo.findById(patientId);

    if (!patient) {
        ApiResponse.throwError(
            HttpStatusCode.NOT_FOUND,
            MESSAGES.PATIENT.NOT_FOUND
        );
    }

    const result = await this._priscriptionRepo.findPrescriptionsPaginated({
        email: patient.email,
        page: query.page,
        limit: query.limit,
        search: query.search,
    });

    return {
        data: result.data.map(rx => this._prescriptionMapper.toDTO(rx)),
        total: result.total,
        page: result.page,
        limit: result.limit,
    };
};
   
}
