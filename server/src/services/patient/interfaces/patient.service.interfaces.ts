import { PatientResponseDTO } from "../../../dto/patient/patient-response.dto.js";
import { HospitalResponseDTO, selectedHospitalDto } from "../../../dto/hospital/hospital-response.dto.js";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.js";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.js";
import { IAppointment } from "../../../models/appointment.js";
import { IPatient } from "../../../models/Patient.model.js";
import { IPaginationResult } from "../../../types/hospital.types.js";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.js";
import { SlotResponseDTO } from "../../../dto/doctor/slot-response.dto.js";

export interface IPatientService {
  getProfile(userId: string): Promise<PatientResponseDTO | null>;
  updateProfile(id: string, data: Partial<IPatient>): Promise<PatientResponseDTO | null>;
  getAllPatient(query: { page: number; limit: number; search: string }): Promise<{ data: PatientResponseDTO[]; total: number }>;
  gethospitals(page: number, limit: number, search: string): Promise<IPaginationResult<HospitalResponseDTO>>;
  changePassword(id: string, current: string, newP: string): Promise<void>;
  selectedHospital(id: string, page: number, limit: number, search: string): Promise<selectedHospitalDto>;
  getDoctorDepartment(id: string, page: number, limit: number, search: string): Promise<IPaginationResult<DoctorResponseDTO>>;
  getDoctorById(id: string): Promise<DoctorResponseDTO>;
  getAvailableSlots(doctorId: string, date: string): Promise<{ slots: SlotResponseDTO[]; appointments: IAppointment[],total:number
  }>;
  bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void>;
  checkDuplicateAppointment(doctorId: string, date: string, patient: { name: string; age: number; email?: string }): Promise<AppointmentResponseDTO | null>;
  getAppoimentHistory(patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: AppointmentResponseDTO[]; total: number }>;
  getTodayAppointments(patientId: string): Promise<AppointmentResponseDTO[]>;
  cancelAppointment(data: { id: string; reason: string }): Promise<void>;
  checkAppointmentStatus(sessionId: string): Promise<boolean>;
  getPrescriptions(patientId: string, query: { page: number; limit: number; search: string }): Promise<{
    data: PrescriptionResponseDTO[]; total: number; page: number; limit: number;
  }>;
  getDoctorFee(doctorId: string): Promise<{ doctorFee: number; hospitalCommission: number }>;

  getWallet(patientId: string):  Promise<{balance: number;totalenrnings: number;totalwithdrawn: number;Transaction?: {
    amount: number;
    type: "credit" | "debit";
    date: string;
  }[];
}>;
  addToWallet(patientId: string, amount: number): Promise<void>;
  withdrawFromWallet(patientId: string, amount: number): Promise<void>;
}
