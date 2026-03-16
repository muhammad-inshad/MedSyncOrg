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
import { selectedHospitalDto, DepartmentResponseDTO, QualificationResponseDTO, SpecializationResponseDTO } from "../../../dto/hospital/hospital-response.dto.ts";
import { Types } from "mongoose";

export class PatientService implements IPatientService {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _hospitalRepo: IHospitalRepository,
    private readonly _departmentRepo: IDepartmentRepository,
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _appointmentRepo: IAppointmentRepository,
    private readonly _qualificationRepo: IQualificationRepository,
    private readonly _specializationRepo: ISpecializationRepository,
    private readonly _subscriptionRepo: ISubscriptionRepository
  ) {}

  async getProfile(userId: string): Promise<IPatient | null> {
    const patient = await this._userRepo.findById(userId);
    if (!patient) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }
    return patient;
  }

  async updateProfile(id: string, data: Partial<IPatient>): Promise<IPatient | null> {
    const updated = await this._userRepo.update(id, data);
    if (!updated) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);
    }
    return updated;
  }

  async getAllPatient(query: { page: number; limit: number; search: string }): Promise<{ data: IPatient[]; total: number }> {
    const result = await this._userRepo.findWithPagination({
      page: query.page,
      limit: query.limit,
      search: query.search,
      searchFields: ["name", "email", "phone"]
    });
    return { data: result.data, total: result.total };
  }

  async gethospitals(page: number, limit: number, search: string): Promise<IPaginationResult<IHospital>> {
    const result = await this._hospitalRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "address", "email"],
      filter: { isActive: true, reviewStatus: "approved" }
    });
    return result as IPaginationResult<IHospital>;
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
      departmentsResult.data.map(async (dept: IDepartment) => {
        const deptObj = dept.toObject ? dept.toObject() : dept;
        const doctorCount = await this._doctorRepo.countByDepartment(id, deptObj._id.toString());
        return {  
          ...deptObj,
          _id: deptObj._id.toString(),
          doctorCount
        } as DepartmentResponseDTO;
      })
    );

    const result: selectedHospitalDto = {
      ...hospital!.toObject(),
      _id: hospital!._id.toString(),
      departments: departmentsWithCounts,
      qualifications: qualifications as unknown as QualificationResponseDTO[],
      specializations: specializations as unknown as SpecializationResponseDTO[],
      totalDepartments: departmentsResult.total,
      currentPage: page,
      totalPages: Math.ceil(departmentsResult.total / limit)
    };

    return result;
  }

  async getDoctorDepartment(id: string, page: number, limit: number, search: string): Promise<IPaginationResult<IDoctor>> {
    const result = await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "specialization"],
      filter: { department: id, isActive: true, reviewStatus: "approved" }
    });
    return result as IPaginationResult<IDoctor>;
  }

  async getDoctorById(id: string): Promise<IDoctor> {
    const doctor = await this._doctorRepo.findById(id);
    if (!doctor) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
    }
    return doctor;
  }

  async getAvailableSlots(doctorId: string, date: string): Promise<{ availableSlots: number; totalSlots: number; bookedCount: number }> {
    const appointmentDate = new Date(date);
    const bookedCount = await this._appointmentRepo.countByDoctorAndDate(doctorId, appointmentDate);
    
    // Default to 20 but could be dynamic based on doctor limit
    const TOTAL_SLOTS = 20;
    const availableSlots = TOTAL_SLOTS - bookedCount;
    
    return {
      availableSlots: availableSlots > 0 ? availableSlots : 0,
      totalSlots: TOTAL_SLOTS,
      bookedCount
    };
  }

  async bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void> {
    const { doctorId, appointmentDate, patientDetails } = data;
    
    if (!doctorId || !appointmentDate || !patientDetails) {
        ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing appointment details");
    }

    const duplicate = await this._appointmentRepo.findDuplicate(doctorId!.toString(), new Date(appointmentDate!), patientDetails!);
    if (duplicate) {
      ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.PATIENT.ALREADYBOOKED);
    }

    const count = await this._appointmentRepo.countByDoctorAndDate(doctorId!.toString(), new Date(appointmentDate!));
    const tokenNumber = count + 1;

    await this._appointmentRepo.create({
      ...data,
      bookedBy: new Types.ObjectId(patientId),
      tokenNumber,
      status: AppointmentStatus.PENDING
    });
  }

  async getAppoimentHistory(patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: IAppointment[]; total: number }> {
    const result = await this._appointmentRepo.findPatientAppointments(patientId, query);
    return { data: result.appointments, total: result.total };
  }

  async getTodayAppointments(patientId: string): Promise<IAppointment[]> {
    return await this._appointmentRepo.findPatientAppointmentsToday(patientId);
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
}
