import { IPatient } from "../../../models/Patient.model.ts";
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
import { IAppointment, AppointmentStatus } from "../../../models/appointment.ts";
import { IPaginationResult } from "../../../types/hospital.types.ts";
import { MongoServerError } from "mongodb";
import bcrypt from "bcryptjs";
import { selectedHospitalDto, HospitalResponseDTO, SelectedHospitalSchema } from "../../../dto/hospital/hospital-response.dto.ts";
import { PatientResponseDTO } from "../../../dto/patient/patient-response.dto.ts";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import { PatientMapper } from "../../../mappers/patient.mapper.ts";
import { HospitalMapper } from "../../../mappers/hospital.mapper.ts";
import { DoctorMapper } from "../../../mappers/doctor.mapper.ts";
import { AppointmentMapper } from "../../../mappers/appointment.mapper.ts";
import mongoose, { Types } from "mongoose";
import { IPrescriptionRepository } from "../../../repositories/Prescription/prescription.repository.interface.ts";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper.ts";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.ts";
import { ISlotRepository } from "../../../repositories/slot/slot.repository.interface.ts";
import { SlotMapper } from "../../../mappers/slot.mapper.ts";
import { SlotResponseDTO } from "../../../dto/doctor/slot-response.dto.ts";
import { HospitalDoctorConfigRepository } from "../../../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.ts";
import { IWalletRepository } from "../../../repositories/wallet/wallet.repository.interface.ts";
import logger from "../../../utils/logger.ts";


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
    private readonly _slotreppo: ISlotRepository,
    private readonly _slotemapper: SlotMapper,
    private readonly _HospitalDoctorConfigRepo: HospitalDoctorConfigRepository,
    private readonly _walletRepository: IWalletRepository
  ) { }

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

    const deptId = new mongoose.Types.ObjectId(id);

    const result = await this._doctorRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["name", "specialization"],
      filter: {
        isActive: true,
        reviewStatus: "approved",
        $or: [
          { department: id },
          { department_id: deptId },
        ],
      },
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

  async getAvailableSlots(doctorId: string, date: string): Promise<{
    slots: SlotResponseDTO[];
    appointments: IAppointment[];
    total: number
  }> {

    const [year, month, day] = date.split('-').map(Number);

    // Use UTC date construction to get correct day of week
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = utcDate.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat

    const [availableSlots, { appointments, total }] = await Promise.all([
      this._slotreppo.findByDoctorId(doctorId),
      this._appointmentRepo.findByDoctorAndDate(doctorId, date)
    ]);

    const filteredSlots = availableSlots.filter(slot => {
      if (!slot.isActive) return false;


      if (!slot.daysOfWeek.includes(dayOfWeek)) return false;

      // Check validFrom - slot shouldn't apply before its start date
      if (slot.validFrom) {
        const validFromDate = new Date(slot.validFrom);
        const validFromUTC = new Date(Date.UTC(
          validFromDate.getUTCFullYear(),
          validFromDate.getUTCMonth(),
          validFromDate.getUTCDate()
        ));
        if (utcDate < validFromUTC) return false;
      }

      if (slot.validUntil) {
        const validUntilDate = new Date(slot.validUntil);
        const validUntilUTC = new Date(Date.UTC(
          validUntilDate.getUTCFullYear(),
          validUntilDate.getUTCMonth(),
          validUntilDate.getUTCDate()
        ));
        if (utcDate > validUntilUTC) return false;
      }

      return true;
    });

    const slotDTOs = this._slotemapper.toDTOList(filteredSlots);

    return {
      slots: slotDTOs,
      appointments,
      total
    };
  }
  async bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void> {
    const { doctorId, appointmentDate, patientDetails, hospitalId, session, totalAmount } = data;

    if (!doctorId || !appointmentDate || !patientDetails || !hospitalId || !session) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Missing required appointment details");
    }

    if (totalAmount !== undefined && totalAmount > 0) {
      logger.info(`[PatientService] Processing payment-related wallet updates for amount: ${totalAmount}`);

      const doctorObjectId = new Types.ObjectId(
        typeof doctorId === "object" ? doctorId._id : doctorId
      );

      const hospitalObjectId = new Types.ObjectId(
        typeof hospitalId === "object" ? hospitalId._id : hospitalId
      );

      const findhospitalWallate = await this._walletRepository.findOne({
        ownerId: hospitalObjectId,
      });

     

      const config = await this._HospitalDoctorConfigRepo.findOne({
        hospitalId: hospitalObjectId,
        doctorId: doctorObjectId,
      });

      if (!config) {
        logger.error(`[PatientService] Config not found for hospital: ${hospitalObjectId} and doctor: ${doctorObjectId}`);
        throw new Error("Hospital-Doctor configuration not found");
      }

      const doctorFee = config.doctorFee || 0;
      const commissionPercent = config.hospitalCommission || 0;

      const hospitalAmount = (doctorFee * commissionPercent) / 100;
      const doctorAmount = doctorFee;

      const finalAmount=hospitalAmount+doctorAmount

      if (!findhospitalWallate) {
        await this._walletRepository.create({
          ownerId: hospitalObjectId,
        });
      }  
       
        await this._walletRepository.creditWallet(hospitalId.toString(), finalAmount);
      
      
    }

    const dateObj = new Date(appointmentDate);

    const doctorSchedules = await this._slotreppo.findByDoctorId(doctorId.toString());

    const selectedSchedule = doctorSchedules.find(s =>
      s.session === session &&
      s.isActive &&
      s.daysOfWeek.includes(dateObj.getDay())
    );

    if (!selectedSchedule) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, `No ${session} session available`);
    }

    const mongoSession = await mongoose.startSession();

    try {
      for (let attempt = 0; attempt < 3; attempt++) {

        mongoSession.startTransaction();

        try {
          const duplicate = await this._appointmentRepo.findDuplicate(
            doctorId.toString(),
            dateObj,
            patientDetails!,
            mongoSession
          );

          if (duplicate) {
            ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.PATIENT.ALREADYBOOKED);
          }

          const sessionBookedCount = await this._appointmentRepo.countByDoctorDateAndSession(
            doctorId.toString(),
            dateObj,
            session,
            mongoSession
          );

          if (sessionBookedCount >= selectedSchedule.tokenPerDay) {
            ApiResponse.throwError(
              HttpStatusCode.BAD_REQUEST,
              `No more slots available for ${session}`
            );
          }

          const tokenNumber = sessionBookedCount + 1;

          const [startHour, startMinute] = selectedSchedule.startTime.split(':').map(Number);
          const startMinutes = startHour * 60 + (startMinute || 0);
          const visitMinutes = startMinutes + (sessionBookedCount * selectedSchedule.slotDuration);

          const visitHour = Math.floor(visitMinutes / 60);
          const visitMin = visitMinutes % 60;

          const visitTime = `${visitHour.toString().padStart(2, '0')}:${visitMin.toString().padStart(2, '0')}`;

          const endMinutes = visitMinutes + selectedSchedule.slotDuration;
          const endHour = Math.floor(endMinutes / 60);
          const endMin = endMinutes % 60;

          const slotEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

          const appointmentData: Partial<IAppointment> = { ...data };

          if (appointmentData.bloodPressure === "") delete appointmentData.bloodPressure;
          if (appointmentData.heartRate === "") delete appointmentData.heartRate;
          if (appointmentData.weight === "") delete appointmentData.weight;

          if (totalAmount === undefined) {
            appointmentData.paymentstatus = "pending";
          } else {
            appointmentData.paymentstatus = "paid";
          }
          const result = await this._appointmentRepo.create(
            {
              ...appointmentData,
              bookedBy: new Types.ObjectId(patientId),
              tokenNumber,
              visitTime,
              slotStartTime: visitTime,
              slotEndTime,
              status: AppointmentStatus.PENDING,
            },
            mongoSession
          );
console.log(result)

          await this._userRepo.addHospital(
            patientId,
            hospitalId.toString(),
            mongoSession
          );

          await mongoSession.commitTransaction();
          logger.info(`[PatientService] Appointment successfully booked with Token: ${tokenNumber}`);


          return;

        } catch (error: unknown) {
          await mongoSession.abortTransaction();
          if (error instanceof MongoServerError && error.code === 11000) {
            console.log("Token conflict, retrying...");
            continue;
          }
          throw error;
        }
      }

      // If all retries fail
      ApiResponse.throwError(HttpStatusCode.CONFLICT, "High traffic, please try again");

    } finally {
      mongoSession.endSession();
    }
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
      status: AppointmentStatus.PROCESSING,
      cancelRequest: true,
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

  getPrescriptions = async (patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: PrescriptionResponseDTO[]; total: number; page: number; limit: number }> => {
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

  getDoctorFee = async (doctorId: string): Promise<{ doctorFee: number; hospitalCommission: number }> => {
    const doctor = await this._HospitalDoctorConfigRepo.findOne({ doctorId });
    if (!doctor) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
    }
    return { doctorFee: doctor.doctorFee, hospitalCommission: doctor.hospitalCommission };
  }

 async getWallet(
  patientId: string
): Promise<{
  balance: number;
  totalenrnings: number;
  totalwithdrawn: number;
  Transaction?: {
    amount: number;
    type: "credit" | "debit";
    date: string;
  }[];
}> {

  const wallet = await this._walletRepository.findOne({
    ownerId: new Types.ObjectId(patientId),
  });

  if (!wallet) {
    return {
      balance: 0,
      totalenrnings: 0,
      totalwithdrawn: 0,
      Transaction: [],
    };
  }

  return {
    balance: wallet.balance,
    totalenrnings: wallet.totalearnings || 0,
    totalwithdrawn: wallet.totalwithdrawn || 0,

    Transaction: (wallet.Transaction || []).map((tx) => ({
      amount: tx.amount,
      type: tx.type,
      date: tx.date.toISOString(),
    })),
  };
}

  async addToWallet(patientId: string, amount: number): Promise<void> {
    await this._walletRepository.creditWallet(patientId, amount);
  } 
  async withdrawFromWallet(patientId: string, amount: number): Promise<void> {
    const wallet = await this._walletRepository.findOne({ ownerId: new Types.ObjectId(patientId) });
    if (!wallet) {
      ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.WALLET.NOT_FOUND);
    }
    await this._walletRepository.debitWallet(patientId, amount);
  }


}
