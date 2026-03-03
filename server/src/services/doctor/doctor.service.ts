
import bcrypt from "bcryptjs";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.ts";
import { ApiResponse } from "../../utils/apiResponse.utils.ts";
import cloudinary from "../../config/cloudinary.ts";
import { extractPublicId } from "../../utils/cloudinaryUpload.ts";
import { ITokenService } from "../token/token.service.interface.ts";
import { HttpStatusCode } from "../../constants/enums.ts";
import { MESSAGES } from "../../constants/messages.ts";
import { UpdateDoctorDTO } from "../../dto/doctor/doctor-response.dto.ts";
import { IDoctor } from "../../models/doctor.model.ts";
import { IDoctorRepository } from "../../repositories/doctor/doctor.repository.interface.ts";

export class DoctorService {
    constructor(private readonly _doctorRepo: IDoctorRepository, private readonly _tokenService: ITokenService) {
    }



    async getDoctorProfile(doctorId: string) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);
        }
        return {
            ...doctor.toObject(),
            role: "doctor"
        };
    }

    async updateDoctorProfile(id: string, updateData: UpdateDoctorDTO) {
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
                // await cloudinary.uploader.destroy(extractPublicId(existingDoctor.licence));
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
            (updateData as any).password = hashedPassword;
            delete updateData.currentPassword;
            delete updateData.newPassword;
        }

        return await this._doctorRepo.update(id, updateData as UpdateDoctorDTO as Partial<IDoctor>);
    }

    async reapply(doctorId: string) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.DOCTOR.NOT_FOUND);

        const updateData = {
            ...doctor.toObject(),
            reviewStatus: "pending",
            reapplyDate: new Date(),
        };

        return await this._doctorRepo.update(doctorId, updateData);
    }
}
