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

    async registerDoctor(body: any, files: any) {
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this._doctorRepo.findByEmail(body.email);
        if (existingDoctor) {
            throw {
                status: StatusCode.CONFLICT,
                message: MESSAGES.AUTH.ALREADY_EXISTS,
            };
        }
        if (files?.profileImage?.[0]) {
            profileImageUrl = await uploadBufferToCloudinary(
                files.profileImage[0].buffer,
                "doctors/profile"
            );
        }

        if (files?.license?.[0]) {
            licenseUrl = await uploadBufferToCloudinary(
                files.license[0].buffer,
                "doctors/license"
            );
        }
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const doctorData: Partial<IDoctor> = {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phone: body.phone,
            address: body.address,
            specialization: body.specialization,
            qualification: body.qualification,
            experience: body.experience,
            department: body.department,
            about: body.about,
            licence: licenseUrl,
            profileImage: profileImageUrl,
            isActive: true,
            isAccountVerified: false,
            reviewStatus: "pending",
            consultationTime: {
                start: "09:00 AM",
                end: "05:00 PM",
            },

            payment: {
                type: "fixed",
                payoutCycle: "monthly",
                patientsPerDayLimit: 10,
                fixedSalary: 0,
            },
        };

        return this._doctorRepo.create(doctorData);
    }

    async loginDoctor(loginData: any)
        : Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const doctor = await this._doctorRepo.findByEmailWithPassword(loginData.email);
        if (!doctor) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }

        if (!doctor.isActive) {
            throw { status: StatusCode.FORBIDDEN, message: MESSAGES.AUTH.ACCOUNT_BLOCKED };
        }

        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            doctor.password
        );

        if (!isPasswordMatch) {
            throw { status: StatusCode.BAD_REQUEST, message: MESSAGES.AUTH.LOGIN_FAILED };
        }
        const accessToken = this._tokenService.generateAccessToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const refreshToken = this._tokenService.generateRefreshToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const { password, ...safeUser } = doctor.toObject();
        return { user: safeUser, accessToken, refreshToken };
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
