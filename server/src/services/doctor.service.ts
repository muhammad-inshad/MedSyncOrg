import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import cloudinary from "../config/cloudinary.ts";
import { extractPublicId } from "../utils/cloudinaryUpload.ts";
import { TokenService } from "./token.service.ts";
import { IDoctor } from "../models/doctor.model.ts";
import { StatusCode } from "../constants/statusCodes.ts";
import { MESSAGES } from "../constants/messages.ts";

export class DoctorService {
    private readonly _doctorRepo: DoctorRepository;
    private readonly _tokenService: TokenService;

    constructor(doctorRepo: DoctorRepository, tokenService: TokenService) {
        this._doctorRepo = doctorRepo;
        this._tokenService = tokenService;
    }


    async getDoctorProfile(doctorId: string) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) {
            throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };
        }
        return {
            ...doctor.toObject(),
            role: "doctor"
        };
    }

    async updateDoctorProfile(id: string, updateData: any) {
        const existingDoctor = await this._doctorRepo.findById(id);
        if (!existingDoctor) throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };

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

        return await this._doctorRepo.update(id, updateData);
    }

    async reapply(doctorId: string, body: any) {
        const doctor = await this._doctorRepo.findById(doctorId);
        if (!doctor) throw { status: StatusCode.NOT_FOUND, message: MESSAGES.DOCTOR.NOT_FOUND };

        const updateData = {
            ...body,
            reviewStatus: "pending",
            reapplyDate: new Date(),
        };

        return await this._doctorRepo.update(doctorId, updateData);
    }
}
