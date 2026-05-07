import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.ts";
import { IAppointments } from "../interfaces/appointment.service.interfaces.ts";
import { AppointmentStatus } from "../../../models/appointment.ts";
import { IPrescriptionData } from "../../../dto/appointment/appointment.dto.ts";
import { IMapper } from "../../../interfaces/mapper.interface.ts";
import { IAppointment } from "../../../models/appointment.ts";
import { AppointmentResponseDTO } from "../../../dto/appointment/appointment-response.dto.ts";
import { IPrescriptionRepository } from "../../../repositories/Prescription/prescription.repository.interface.ts";
import { IWalletRepository } from "../../../repositories/wallet/wallet.repository.interface.ts";
import { IHospitalDoctorConfigRepository } from "../../../repositories/HospitalDoctorConfig/HospitalDoctorConfigRepository.interface.ts";
import { Types } from "mongoose";
import { PrescriptionMapper } from "../../../mappers/prescription.mapper.ts";
import { PrescriptionResponseDTO } from "../../../dto/patient/prescription-response.dto.ts";

export class AppointmentService implements IAppointments {
  constructor(
    private readonly _appointmentRepo: IAppointmentRepository,
    private readonly _appointmentMapper: IMapper<IAppointment, AppointmentResponseDTO>,
    private readonly _prescriptionRepo: IPrescriptionRepository,
    private readonly _HospitalDoctorConfigRepo: IHospitalDoctorConfigRepository,
    private readonly _WalletRepo: IWalletRepository,
    private readonly prescriptionMapper: PrescriptionMapper
  ) { }

  async getUpcomingAppointments(
    doctorId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
      date?: string;
    }
  ): Promise<{ appointments: AppointmentResponseDTO[]; total: number }> {
    const { page, limit, search, date } = options;

    const res = await this._appointmentRepo.findUpcomingAppointments(doctorId, {
      page,
      limit,
      search,
      date: date ? new Date(date) : undefined
    });

    return {
      appointments: res.appointments.map(app => this._appointmentMapper.toDTO(app)),
      total: res.total
    };
  }

  async getTodayConsultations(
    doctorId: string,
    options?: { page: number; limit: number; shift: string }
  ): Promise<{ appointments: AppointmentResponseDTO[]; total: number }> {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0];

    const res = await this._appointmentRepo.findtodayconseltation(
      doctorId,
      dateString,
      options
    );

    return {
      appointments: res.appointments.map((app) => this._appointmentMapper.toDTO(app)),
      total: res.total,
    };
  }

  async updateStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<AppointmentResponseDTO | null> {

  const appointment = await this._appointmentRepo.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const config = await this._HospitalDoctorConfigRepo.findOne({
    doctorId: appointment.doctorId,
    hospitalId: appointment.hospitalId,
  });

  if (!config) {
    throw new Error("Config not found");
  }

  const doctorAmount = config.doctorFee;
  const hospitalAmount =
    (doctorAmount * config.hospitalCommission) / 100;


  const findDoctrorWallet = await this._WalletRepo.findOne({
    ownerId: appointment.doctorId,
  });

  if (!findDoctrorWallet) {
    await this._WalletRepo.create({
      ownerId: appointment.doctorId as Types.ObjectId,
    });
  }

  const findHospitalWallet = await this._WalletRepo.findOne({
    ownerId: appointment.hospitalId,
  });

  if (!findHospitalWallet) {
    await this._WalletRepo.create({
      ownerId: appointment.hospitalId as Types.ObjectId,
    });
  }

  if (appointment.paymentstatus === "pending") {

    await this._WalletRepo.creditWallet(
      appointment.doctorId.toString(),
      doctorAmount
    );

    await this._WalletRepo.creditWallet(
      appointment.hospitalId.toString(),
      hospitalAmount
    );

  } else {

    await this._WalletRepo.debitWallet(
      appointment.hospitalId.toString(),
      doctorAmount
    );

    await this._WalletRepo.creditWallet(
      appointment.doctorId.toString(),
      doctorAmount
    );
  }

  const updated = await this._appointmentRepo.update(
    appointmentId,
    { status }
  );

  return updated
    ? this._appointmentMapper.toDTO(updated)
    : null;
}

  async savePrescription(
    appointmentId: string,
    prescriptionData: IPrescriptionData
  ): Promise<PrescriptionResponseDTO| null> {
    const appointment = await this._appointmentRepo.findById(appointmentId);
    if (!appointment) return null;

    if (!appointment.patientDetails.email) {
      throw new Error("Patient email is required");
    }

    const doctorId = typeof appointment.doctorId === "object"
      ? appointment.doctorId._id
      : appointment.doctorId;
    const prescriptionPayload = {
      hospital_id: appointment.hospitalId,
      patient_email: appointment.patientDetails.email,
      doctor_id: doctorId,
      appointment_id: appointment._id,
      medicines: prescriptionData.medicines,
      notes: prescriptionData.notes,
    };

    const prescription = await this._prescriptionRepo.create(prescriptionPayload);
    if (!prescription) {
      throw new Error("Failed to save prescription");
    }

     const prescriptionDTO = this.prescriptionMapper.toDTO(prescription);

  return prescriptionDTO;
  }
}