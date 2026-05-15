import bcrypt from "bcryptjs";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import cloudinary from "../../../config/cloudinary.js";
import { extractPublicId } from "../../../utils/cloudinaryUpload.js";
import { ITokenService } from "../../token/token.service.interface.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { MESSAGES } from "../../../constants/messages.js";
import { UpdateDoctorDTO, DoctorResponseDTO } from "../../../dto/doctor/doctor-response.dto.js";
import { DoctorLeaveResponseDTO } from "../../../dto/doctor/doctor-leave-response.dto.js";
import { IDoctor } from "../../../models/doctor.model.js";
import { IDoctorRepository } from "../../../repositories/doctor/doctor.repository.interface.js";
import { IAppointmentRepository } from "../../../repositories/appointment/appointment.repository.interface.js";
import { ILeaveRepository } from "../../../repositories/leave/leave.repository.interface.js";
import { IDoctorService } from "../interfaces/doctor.service.interfaces.js";
import { Types } from "mongoose";
import { DoctorMapper } from "../../../mappers/doctor.mapper.js";
import { DoctorLeaveMapper } from "../../../mappers/doctor-leave.mapper.js";
import { IDoctorLeave } from "../../../models/doctorLeave.model.js";

export class DoctorService implements IDoctorService {
    constructor(
        private readonly _doctorRepo: IDoctorRepository,
        private readonly _tokenService: ITokenService,
        private readonly _appointmentRepo: IAppointmentRepository,
        private readonly _leaveRepo: ILeaveRepository,
        private readonly _doctorMapper: DoctorMapper,
        private readonly _leaveMapper: DoctorLeaveMapper
    ) {
    }

    async getDoctorProfile(doctorId: string): Promise<DoctorResponseDTO> {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }
        return this._doctorMapper.toDTO(doctor);
    }

    async updateDoctorProfile(id: string, updateData: UpdateDoctorDTO): Promise<DoctorResponseDTO> {
        const existingDoctor = await this._doctorRepo.findById(id);
        if (!existingDoctor) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);

        if (updateData.profileImageFile) {
            if (existingDoctor.profileImage) {
                await cloudinary.uploader.destroy(extractPublicId(existingDoctor.profileImage));
            }
            const profileImageUrl = await uploadBufferToCloudinary(
                updateData.profileImageFile.buffer,
                "doctors/profile"
            );
            updateData.profileImage = profileImageUrl;
            delete updateData.profileImageFile;
        } else if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {

            const res = await cloudinary.uploader.upload(updateData.profileImage, {
                folder: 'doctors/profiles'
            });
            updateData.profileImage = res.secure_url;
        }

        if (updateData.licenseFile) {
            if (existingDoctor.licence) {
                await cloudinary.uploader.destroy(extractPublicId(existingDoctor.licence));
            }
            const licenseUrl = await uploadBufferToCloudinary(
                updateData.licenseFile.buffer,
                "doctors/license"
            );
            updateData.licence = licenseUrl;
            delete updateData.licenseFile;
        } else if (updateData.licenseImage && updateData.licenseImage.startsWith('data:image')) {
            const res = await cloudinary.uploader.upload(updateData.licenseImage, {
                folder: 'doctors/licenses'
            });
            updateData.licence = res.secure_url;
            delete updateData.licenseImage;
        }
        updateData.rejectionReason = undefined;

        if (updateData.currentPassword && updateData.newPassword) {
            const doctorWithPassword = await this._doctorRepo.findByIdWithPassword(id);
            if (!doctorWithPassword) {
                ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
            }

            const isPasswordMatch = await bcrypt.compare(
                updateData.currentPassword,
                doctorWithPassword.password
            );

            if (!isPasswordMatch) {
                ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Current password does not match");
            }

            const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
            (updateData as Partial<IDoctor>).password = hashedPassword;
            delete updateData.currentPassword;
            delete updateData.newPassword;
        }

        const updated = await this._doctorRepo.update(id, updateData as UpdateDoctorDTO as Partial<IDoctor>);
        return this._doctorMapper.toDTO(updated!);
    }

    async reapply(doctorId: string): Promise<DoctorResponseDTO> {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);

        const updateData = {
            ...doctor.toObject(),
            reviewStatus: "pending",
            reapplyDate: new Date(),
        };

        const updated = await this._doctorRepo.update(doctorId, updateData as Partial<IDoctor>);
        return this._doctorMapper.toDTO(updated!);
    }

    async applyLeave(doctorId: string, leaveData: { startDate: Date; endDate: Date; leaveSession?: "morning" | "afternoon" | "evening" | "night"; reason?: string; photo?: string | Express.Multer.File }): Promise<DoctorLeaveResponseDTO> {
        let photoUrl = "";
        if (leaveData.photo) {
            if (typeof leaveData.photo === 'string' && leaveData.photo.startsWith('data:image')) {
                const res = await cloudinary.uploader.upload(leaveData.photo, {
                    folder: 'doctors/leaves'
                });
                photoUrl = res.secure_url;
            } else if (typeof leaveData.photo !== 'string') {
                photoUrl = await uploadBufferToCloudinary(
                    leaveData.photo.buffer,
                    "doctors/leaves"
                );
            }
        }

        const leave = await this._leaveRepo.create({
            doctorId: doctorId as unknown as Types.ObjectId,
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            leaveSession: leaveData.leaveSession,
            reason: leaveData.reason,
            photo: photoUrl,
            status: "pending"
        });

        return this._leaveMapper.toDTO(leave as IDoctorLeave);
    }

    async getDoctorLeaves(options: {
        doctorId: string;
        page: number;
        limit: number;
        startDate?: Date;
        endDate?: Date
    }): Promise<{ data: DoctorLeaveResponseDTO[]; total: number; page: number; limit: number }> {
        const res = await this._leaveRepo.findDoctorLeaves(options);
        return {
            ...res,
            data: res.data.map(l => this._leaveMapper.toDTO(l))
        };
    }
}
