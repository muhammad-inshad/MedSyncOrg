import { Types } from "mongoose";
import cloudinary from "../../config/cloudinary.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import { IHospitalRepository } from "../../repositories/hospital/hospital.repository.interface.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { UpdatePatientDTO } from "../../dto/patient/patient-response.dto.ts";
import { IUserRepository } from "../../repositories/patient/user.repository.interface.ts";
import { IPatientService } from "./patient.service.interfaces.ts";
import bcrypt from "bcryptjs";
import { MESSAGES } from "../../constants/messages.ts";
import { IDepartmentRepository } from "../../repositories/hospital/department.repository.interface.ts";
import { IDoctorRepository } from "../../repositories/doctor/doctor.repository.interface.ts";
import { IDepartment } from "../../models/department.model.ts";
import { DepartmentResponseDTO, QualificationResponseDTO, selectedHospitalDto, SpecializationResponseDTO } from "../../dto/hospital/hospital-response.dto.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { DoctorResponseDTO } from "../../dto/doctor/doctor-response.dto.ts";
import { BookAppointmentDTO, DoctorDailySlotsDTO } from "../../dto/appointment/appointment.dto.ts";
import { IAppointmentRepository } from "../../repositories/appointment/appointment.repository.interface.ts";
import { IAppointment, AppointmentStatus, AppointmentMode } from "../../models/appointment.ts";
import { IQualificationRepository } from "../../repositories/hospital/qualification.repository.interface.ts";
import { ISpecializationRepository } from "../../repositories/hospital/specialization.repository.interface.ts";


export class PatientService implements IPatientService {
    constructor(
        private readonly _userRepo: IUserRepository,
        private readonly _hospitalRepo: IHospitalRepository,
        private readonly _departmentRepo: IDepartmentRepository,
        private readonly _doctorRepo: IDoctorRepository,
        private readonly _appointmentRepo: IAppointmentRepository,
        private readonly _qualificationRepo: IQualificationRepository,
        private readonly _specializationRepo: ISpecializationRepository
    ) { }

    async getProfile(userId: string) {
        const patient = await this._userRepo.findById(userId);

        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        const patientObj = patient.toObject ? patient.toObject() : patient;
        delete patientObj.password;

        return patientObj;
    }

    async getAllPatient(options: { page: number; limit: number; search?: string; filter?: object }) {
        const { page, limit, search, filter } = options;
        return await this._userRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name", "email", "qualification", "department"],
            filter
        });
    }

    async updateProfile(id: string, updateData: UpdatePatientDTO) {
        const existingPatient = await this._userRepo.findById(id);
        if (!existingPatient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }
        if (updateData.image && updateData.image.startsWith('data:image')) {
            if (existingPatient.image) {
                const publicId = existingPatient.image.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`patient/profile/${publicId}`);
                }
            }
            const res = await cloudinary.uploader.upload(updateData.image, {
                folder: 'patient/profile'
            });
            updateData.image = res.secure_url;

        } else if (updateData.willRemoveImage === true) {
            if (existingPatient.image) {
                const publicId = existingPatient.image.split('/').pop()?.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(`patient/profile/${publicId}`);
                }
            }
            updateData.image = "";
        } else {
            delete updateData.image;
        }
        delete updateData.willRemoveImage;
        if (updateData.isActive !== undefined) {
            updateData.isActive = String(updateData.isActive) === 'true';
        }

        return await this._userRepo.update(id, updateData);
    }

    async gethospitals(page: number, limit: number, search: string) {

        const result = await this._hospitalRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ['hospitalName', 'address'],
            filter: { isActive: true }
        });

        const cleanedHospitals = result.data.map(hospital => {
            const hospitalObj = hospital.toObject ? hospital.toObject() : hospital;
            delete hospitalObj.password;
            return hospitalObj;
        });

        return {
            hospitals: cleanedHospitals,
            totalCount: result.total,
            totalPages: Math.ceil(result.total / limit),
            currentPage: page
        };
    }
    async changePassword(id: string, currentPassword: string, newPassword: string) {
        const patient = await this._userRepo.findByIdWithPassword(id);
        if (!patient) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Patient not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, patient.password);
        if (!isMatch) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Current password does not match");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        await this._userRepo.update(id, { password: hashedNewPassword });
    }

    async selectedHospital(id: string, page: number = 1, limit: number = 6, search: string = "") {
        const hospital = await this._hospitalRepo.findById(id)
        if (!hospital) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.ADMIN.NOT_FOUND)
        }

        const hospitalObj = hospital.toObject ? hospital.toObject() : hospital
        const { data: departments, total } = await this._departmentRepo.findByHospitalId(id, page, limit, search);
        const [qualifications, specializations] = await Promise.all([
            this._qualificationRepo.findByHospitalId(id),
            this._specializationRepo.findByHospitalId(id)
        ]);

        const departmentsWithCount = await Promise.all(departments.map(async (dept: IDepartment) => {
            const doctorCount = await this._doctorRepo.countByDepartment(id, dept._id.toString());
            return {
                ...dept.toObject(),
                doctorCount
            };
        })) as DepartmentResponseDTO[];

        const qualificationData = qualifications
            .filter(q => q.isActive)
            .map(q => ({
                _id: q._id.toString(),
                name: q.name,
                qualificationName: q.name,
                description: q.description,
                image: q.image
            })) as QualificationResponseDTO[];

        const specializationData = specializations
            .filter(s => s.isActive)
            .map(s => ({
                _id: s._id.toString(),
                name: s.name,
                description: s.description,
                image: s.image,
                department_id: s.department_id.toString()
            })) as SpecializationResponseDTO[];

        return {
            ...hospitalObj,
            _id: hospitalObj._id.toString(),
            departments: departmentsWithCount,
            qualifications: qualificationData,
            specializations: specializationData,
            totalDepartments: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        } as selectedHospitalDto;
    }

    async getDoctorDepartment(
        id: string,
        page: number,
        limit: number,
        search: string
    ) {
        const department = await this._departmentRepo.findById(id);

        if (!department) {
            ApiResponse.throwError(
                HttpStatusCode.NOT_FOUND,
                MESSAGES.DOCTOR.NOT_FOUND
            );
        }

        const result = await this._doctorRepo.findWithPagination({
            page,
            limit,
            search,
            searchFields: ["name"],
            filter: {
                department: id,
                isActive: true,
                reviewStatus: "approved"
            }
        });

        const doctorData = result.data.map((doctor: IDoctor) => {
            const docObj = doctor.toObject ? doctor.toObject() : doctor;
            delete docObj.password;
            return {
                ...docObj,
                id: docObj._id.toString(),
                _id: docObj._id.toString(),
                hospital_id: docObj.hospital_id?.toString()
            };
        }) as unknown as DoctorResponseDTO[];

        return {
            data: doctorData,
            total: result.total
        };
    }

    async getDoctorById(id: string) {
        const doctor = await this._doctorRepo.findById(id);

        if (!doctor || !doctor.isActive || doctor.reviewStatus !== "approved") {
            ApiResponse.throwError(
                HttpStatusCode.NOT_FOUND,
                MESSAGES.DOCTOR.NOT_FOUND
            );
        }

        const docObj = doctor.toObject ? doctor.toObject() : doctor;
        delete docObj.password;

        return {
            ...docObj,
            id: docObj._id.toString(),
            _id: docObj._id.toString(),
            hospital_id: docObj.hospital_id?.toString()
        } as unknown as DoctorResponseDTO;
    }
    async getAvailableSlots(doctorId: string, date: string): Promise<DoctorDailySlotsDTO> {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }

        const appointmentDate = new Date(date);
        const bookedTokens = await this._appointmentRepo.countByDoctorAndDate(doctorId, appointmentDate);
        const maxTokens = doctor.payment?.patientsPerDayLimit || 20;

        let status: "Available" | "Filling Fast" | "Fully Booked" = "Available";
        const occupancy = (bookedTokens / maxTokens) * 100;

        if (occupancy >= 100) {
            status = "Fully Booked";
        } else if (occupancy >= 80) {
            status = "Filling Fast";
        }

        return {
            date,
            tokenInfo: {
                date,
                bookedTokens,
                maxTokens,
                status
            }
        };
    }

    async bookAppointment(patientId: string, data: BookAppointmentDTO): Promise<void> {
        const appointmentDate = new Date(data.appointmentDate);

        const doctor = await this._doctorRepo.findById(data.doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }

        const existingAppointment = await this._appointmentRepo.findDuplicate(
            data.doctorId,
            appointmentDate,
            {
                name: data.patientDetails.fullName,
                age: data.patientDetails.age,
                email: data.patientDetails.email
            }
        );

        if (existingAppointment) {
            ApiResponse.throwError(
                HttpStatusCode.BAD_REQUEST,
                MESSAGES.PATIENT.ALREADYBOOKED
            );
        }

        const bookedTokens = await this._appointmentRepo.countByDoctorAndDate(data.doctorId, appointmentDate);
        const maxTokens = doctor.payment?.patientsPerDayLimit || 20;

        if (bookedTokens >= maxTokens) {
            ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.PATIENT.NOAVILABLETOKEN);
        }
        const tokenNumber = bookedTokens + 1;

        await this._appointmentRepo.create({
            bookedBy: new Types.ObjectId(patientId),
            doctorId: new Types.ObjectId(data.doctorId),
            hospitalId: new Types.ObjectId(data.hospitalId),
            appointmentDate,
            tokenNumber,
            visitTime: data.visitTime,
            mode: data.mode as AppointmentMode,
            status: AppointmentStatus.PENDING,
            patientDetails: {
                name: data.patientDetails.fullName,
                age: data.patientDetails.age,
                phone: data.patientDetails.phone,
                email: data.patientDetails.email,
                address: data.patientDetails.address
            },
            bloodPressure: data.patientDetails.bloodPressure,
            heartRate: data.patientDetails.heartRate,
            weight: data.patientDetails.weight
        });
    }

    async getAppoimentHistory(patientId: string, options: { page: number; limit: number; search?: string }): Promise<{ data: IAppointment[]; total: number }> {
        const result = await this._appointmentRepo.findPatientAppointments(patientId, options);
        return {
            data: result.appointments,
            total: result.total
        };
    }

      async cancelAppointment(data: { id: string; reason: string }): Promise<IAppointment | null> {
        const appointment = await this._appointmentRepo.findById(data.id);
        if (!appointment) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, "Appointment not found");
        }
              const today = new Date();
    const appointmentDate = new Date(appointment!.appointmentDate);
    today.setHours(0,0,0,0);
    appointmentDate.setHours(0,0,0,0);
      const diffInDays =
        (appointmentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays <= 1) {
       return ApiResponse.throwError(
            HttpStatusCode.BAD_REQUEST,
            "Cancellation not allowed on the same day or the day before the appointment. Booking is confirmed and non-refundable."
        );
    }
        const updated = await this._appointmentRepo.update(data.id, {
            status: AppointmentStatus.CANCELLED,
            cancelReason: data.reason
        } as Partial<IAppointment>);

        return updated;
    }
}
