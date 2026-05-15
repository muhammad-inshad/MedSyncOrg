import bcrypt from "bcryptjs";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.js";
import { ApiResponse } from "../../../utils/apiResponse.utils.js";
import cloudinary from "../../../config/cloudinary.js";
import { extractPublicId } from "../../../utils/cloudinaryUpload.js";
import { HttpStatusCode } from "../../../constants/enums.js";
import { MESSAGES } from "../../../constants/messages.js";
export class DoctorService {
    constructor(_doctorRepo, _tokenService, _appointmentRepo, _leaveRepo, _doctorMapper, _leaveMapper) {
        this._doctorRepo = _doctorRepo;
        this._tokenService = _tokenService;
        this._appointmentRepo = _appointmentRepo;
        this._leaveRepo = _leaveRepo;
        this._doctorMapper = _doctorMapper;
        this._leaveMapper = _leaveMapper;
    }
    async getDoctorProfile(doctorId) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }
        return this._doctorMapper.toDTO(doctor);
    }
    async updateDoctorProfile(id, updateData) {
        const existingDoctor = await this._doctorRepo.findById(id);
        if (!existingDoctor)
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        if (updateData.profileImageFile) {
            if (existingDoctor.profileImage) {
                await cloudinary.uploader.destroy(extractPublicId(existingDoctor.profileImage));
            }
            const profileImageUrl = await uploadBufferToCloudinary(updateData.profileImageFile.buffer, "doctors/profile");
            updateData.profileImage = profileImageUrl;
            delete updateData.profileImageFile;
        }
        else if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
            const res = await cloudinary.uploader.upload(updateData.profileImage, {
                folder: 'doctors/profiles'
            });
            updateData.profileImage = res.secure_url;
        }
        if (updateData.licenseFile) {
            if (existingDoctor.licence) {
                await cloudinary.uploader.destroy(extractPublicId(existingDoctor.licence));
            }
            const licenseUrl = await uploadBufferToCloudinary(updateData.licenseFile.buffer, "doctors/license");
            updateData.licence = licenseUrl;
            delete updateData.licenseFile;
        }
        else if (updateData.licenseImage && updateData.licenseImage.startsWith('data:image')) {
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
            const isPasswordMatch = await bcrypt.compare(updateData.currentPassword, doctorWithPassword.password);
            if (!isPasswordMatch) {
                ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Current password does not match");
            }
            const hashedPassword = await bcrypt.hash(updateData.newPassword, 10);
            updateData.password = hashedPassword;
            delete updateData.currentPassword;
            delete updateData.newPassword;
        }
        const updated = await this._doctorRepo.update(id, updateData);
        return this._doctorMapper.toDTO(updated);
    }
    async reapply(doctorId) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor)
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        const updateData = {
            ...doctor.toObject(),
            reviewStatus: "pending",
            reapplyDate: new Date(),
        };
        const updated = await this._doctorRepo.update(doctorId, updateData);
        return this._doctorMapper.toDTO(updated);
    }
    async applyLeave(doctorId, leaveData) {
        let photoUrl = "";
        if (leaveData.photo) {
            if (typeof leaveData.photo === 'string' && leaveData.photo.startsWith('data:image')) {
                const res = await cloudinary.uploader.upload(leaveData.photo, {
                    folder: 'doctors/leaves'
                });
                photoUrl = res.secure_url;
            }
            else if (typeof leaveData.photo !== 'string') {
                photoUrl = await uploadBufferToCloudinary(leaveData.photo.buffer, "doctors/leaves");
            }
        }
        const leave = await this._leaveRepo.create({
            doctorId: doctorId,
            startDate: leaveData.startDate,
            endDate: leaveData.endDate,
            leaveSession: leaveData.leaveSession,
            reason: leaveData.reason,
            photo: photoUrl,
            status: "pending"
        });
        return this._leaveMapper.toDTO(leave);
    }
    async getDoctorLeaves(options) {
        const res = await this._leaveRepo.findDoctorLeaves(options);
        return {
            ...res,
            data: res.data.map(l => this._leaveMapper.toDTO(l))
        };
    }
}
