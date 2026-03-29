import { PatientResponseDTO } from "../../../dto/patient/patient-response.dto.ts";
import { HospitalResponseDTO, selectedHospitalDto } from "../../../dto/hospital/hospital-response.dto.ts";
import { DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.ts";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import { IAppointment } from "../../../models/appointment.ts";
import { IPatient } from "../../../models/Patient.model.ts";
import { IPaginationResult } from "../../../types/hospital.types.ts";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.ts";

export interface IPatientService {
  getProfile(userId: string): Promise<PatientResponseDTO | null>;
  updateProfile(id: string, data: Partial<IPatient>): Promise<PatientResponseDTO | null>;
  getAllPatient(query: { page: number; limit: number; search: string }): Promise<{ data: PatientResponseDTO[]; total: number }>;
  gethospitals(page: number, limit: number, search: string): Promise<IPaginationResult<HospitalResponseDTO>>;
  changePassword(id: string, current: string, newP: string): Promise<void>;
  selectedHospital(id: string, page: number, limit: number, search: string): Promise<selectedHospitalDto>;
  getDoctorDepartment(id: string, page: number, limit: number, search: string): Promise<IPaginationResult<DoctorResponseDTO>>;
  getDoctorById(id: string): Promise<DoctorResponseDTO>;
  getAvailableSlots(doctorId: string, date: string): Promise<{ tokenInfo: { availableSlots: number; totalSlots: number; bookedTokens: number; maxTokens: number; status: "Available" | "Filling Fast" | "Fully Booked" } }>;
  bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void>;
  checkDuplicateAppointment(doctorId: string, date: string, patient: { name: string; age: number; email?: string }): Promise<AppointmentResponseDTO | null>;
  getAppoimentHistory(patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: AppointmentResponseDTO[]; total: number }>;
  getTodayAppointments(patientId: string): Promise<AppointmentResponseDTO[]>;
  cancelAppointment(data: { id: string; reason: string }): Promise<void>;
  checkAppointmentStatus(sessionId: string): Promise<boolean>;
  getPrescriptions(patientId: string, query: { page: number; limit: number; search: string }): Promise<{
    data: PrescriptionResponseDTO[]; total: number; page: number; limit: number;
  }>;
}
