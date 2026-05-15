import mongoose, { ClientSession, FilterQuery, Types } from "mongoose";
import { BaseRepository } from "../IBase/BaseRepository.js";
import {
  IAppointment,
  AppointmentModel,
  AppointmentStatus,
} from "../../models/appointment.js";
import { IAppointmentRepository } from "./appointment.repository.interface.js";

export class AppointmentRepository
  extends BaseRepository<IAppointment>
  implements IAppointmentRepository {
  constructor() {
    super(AppointmentModel);
  }

  async findByDoctorAndDate(
    doctorId: string,
    dateString: string,
  ): Promise<{ appointments: IAppointment[]; total: number }> {
    const year = parseInt(dateString.split("-")[0]);
    const month = parseInt(dateString.split("-")[1]) - 1;
    const day = parseInt(dateString.split("-")[2]);
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);
    const query = {
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ["cancelled"] },
    };

    const appointments = await this.model
      .find(query)
      .sort({ session: 1, tokenNumber: 1 })
      .exec();

    return {
      appointments,
      total: appointments.length,
    };
  }

  async findtodayconseltation(
    doctorId: string,
    dateString: string,
    options?: { page: number; limit: number; shift: string },
  ): Promise<{ appointments: IAppointment[]; total: number }> {
    const year = parseInt(dateString.split("-")[0]);
    const month = parseInt(dateString.split("-")[1]) - 1;
    const day = parseInt(dateString.split("-")[2]);

    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999);

    const baseQuery: FilterQuery<IAppointment> = {
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $nin: ["cancelled"] },
    };

    const query: FilterQuery<IAppointment> = { ...baseQuery };

    if (options?.shift) {
      query.session = options.shift;
    }

    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const total = await this.model.countDocuments(query);

    const appointments = await this.model
      .find(query)
      .sort({ session: 1, tokenNumber: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      appointments,
      total,
    };
  }
  async countByDoctorAndDate(doctorId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .countDocuments({
        doctorId: doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .exec();
  }

  async findUpcomingAppointments(
    doctorId: string,
    options: { page: number; limit: number; search?: string; date?: Date },
  ): Promise<{ appointments: IAppointment[]; total: number }> {
    const { page, limit, search, date } = options;
    const skip = (page - 1) * limit;
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new Error("Invalid doctorId");
    }

    const ObjectDoctorId = new mongoose.Types.ObjectId(doctorId);

    const query: FilterQuery<IAppointment> = {
      doctorId: ObjectDoctorId,
      status: { $nin: [AppointmentStatus.COMPLETED] },
    };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      query.appointmentDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.appointmentDate = { $gte: today };
    }
    if (search && search.trim()) {
      query.$or = [
        { "patientDetails.name": { $regex: search, $options: "i" } },
        { "patientDetails.phone": { $regex: search, $options: "i" } },
      ];
    }
    const [appointments, total] = await Promise.all([
      this.model
        .find(query)
        .populate("bookedBy", "name email image")
        .sort({ appointmentDate: 1, visitTime: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      this.model.countDocuments(query).exec(),
    ]);
    return { appointments, total };
  }

  async findDuplicate(
    doctorId: string,
    date: Date,
    patient: { name: string; age: number; email?: string },
    session?: ClientSession,
  ): Promise<IAppointment | null> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .findOne({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        "patientDetails.name": patient.name,
        "patientDetails.age": patient.age,
        "patientDetails.email": patient.email,
        status: { $ne: "cancelled" },
      })
      .session(session ?? null);
  }

  async findPatientAppointments(
    patientId: string,
    options: {
      page: number;
      limit: number;
      search?: string;
    },
  ): Promise<{ appointments: IAppointment[]; total: number }> {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    const query: FilterQuery<IAppointment> = {
      bookedBy: new Types.ObjectId(patientId),
    };

    if (search) {
      const doctors = await mongoose
        .model("Doctor")
        .find({
          $or: [
            { name: { $regex: search, $options: "i" } },
            { specialization: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
          ],
        })
        .select("_id");
      const doctorIds = doctors.map((d) => d._id);
      query.doctorId = { $in: doctorIds };
    }

    const [appointments, total] = await Promise.all([
      this.model
        .find(query)
        .populate("doctorId", "name specialization department profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return { appointments, total };
  }

  async findLiveToken(doctorId: string): Promise<IAppointment | null> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .findOne({
        doctorId: doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: AppointmentStatus.PENDING,
      })
      .sort({ tokenNumber: 1 })
      .exec();
  }

  async findDoctorByPatientToday(patientId: string): Promise<string | null> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const appointment = await this.model
      .findOne({
        bookedBy: new Types.ObjectId(patientId),
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .select("doctorId")
      .exec();

    return appointment ? appointment.doctorId.toString() : null;
  }

  async findPatientAppointmentsToday(
    patientId: string,
  ): Promise<IAppointment[]> {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .find({
        bookedBy: new Types.ObjectId(patientId),
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .populate("doctorId", "name specialization department profileImage")
      .sort({ tokenNumber: 1 })
      .exec();
  }

  async findByPaymentId(paymentId: string): Promise<IAppointment | null> {
    return await this.model.findOne({ paymentId }).exec();
  }

  getPatientEmail(appointmentId: string): Promise<string | null> {
    return this.model
      .findById(appointmentId)
      .select("patientDetails.email")
      .exec()
      .then((appointment) =>
        appointment ? appointment.patientDetails.email || null : null,
      );
  }

  async countByDoctorDateAndSession(
    doctorId: string,
    date: Date,
    session: string,
    mongoSession?: ClientSession,
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.model
      .countDocuments({
        doctorId: doctorId,
        appointmentDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        session: session,
        status: { $nin: [AppointmentStatus.CANCELLED] },
      })
      .session(mongoSession ?? null)
      .exec();
  }

}
