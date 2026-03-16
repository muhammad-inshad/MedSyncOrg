import { IPatient } from "../../../models/Patient.model.ts";
import { IHospital } from "../../../models/hospital.model.ts";
import { IDoctor } from "../../../models/doctor.model.ts";
import { selectedHospitalDto } from "../../../dto/hospital/hospital-response.dto.ts";
import { IAppointment } from "../../../models/appointment.ts";
import { IPaginationResult } from "../../../types/hospital.types.ts";

export interface IPatientService {
  getProfile(userId: string): Promise<IPatient | null>;
  updateProfile(id: string, data: Partial<IPatient>): Promise<IPatient | null>;
  getAllPatient(query: { page: number; limit: number; search: string }): Promise<{ data: IPatient[]; total: number }>;
  gethospitals(page: number, limit: number, search: string): Promise<IPaginationResult<IHospital>>;
  changePassword(id: string, current: string, newP: string): Promise<void>;
  selectedHospital(id: string, page: number, limit: number, search: string): Promise<selectedHospitalDto>;
  getDoctorDepartment(id: string, page: number, limit: number, search: string): Promise<IPaginationResult<IDoctor>>;
  getDoctorById(id: string): Promise<IDoctor>;
  getAvailableSlots(doctorId: string, date: string): Promise<{ availableSlots: number; totalSlots: number; bookedCount: number }>;
  bookAppointment(patientId: string, data: Partial<IAppointment>): Promise<void>;
  getAppoimentHistory(patientId: string, query: { page: number; limit: number; search: string }): Promise<{ data: IAppointment[]; total: number }>;
  getTodayAppointments(patientId: string): Promise<IAppointment[]>;
  cancelAppointment(data: { id: string; reason: string }): Promise<void>;
}
