import { DoctorRepository } from "../repository/doctor.repository.ts";
import { uploadBufferToCloudinary } from "../../../utils/cloudinaryUpload.ts";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import cloudinary from "../../../config/cloudinary";
import { extractPublicId } from "../../../utils/cloudinaryUpload";
import { TokenService } from "../../auth/services/token.service.ts";
import { IDoctor } from "../../../model/doctor.model.ts";

export class DoctorService {
    private doctorRepo: DoctorRepository;
    private tokenService!: TokenService;
    constructor(doctorRepo: DoctorRepository, tokenService: TokenService) {
        this.doctorRepo = doctorRepo;
        this.tokenService = tokenService;
    }

    async registerDoctor(body: any, files: any) {
        let profileImageUrl = "";
        let licenseUrl = "";
        const existingDoctor = await this.doctorRepo.findByEmail(body.email);
        if (existingDoctor) {
            throw {
                status: 409,
                message: "Doctor already exists",
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
            isActive: false,
            isAccountVerified: false,
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

        return this.doctorRepo.createDoctor(doctorData);
    }

    async loginDoctor(loginData: any)
        : Promise<{ user: any; accessToken: string; refreshToken: string }> {
        const doctor = await this.doctorRepo.findByEmail(loginData.email);
        if (!doctor) {
            throw { status: 400, message: "Invalid email or password" };
        }

        const isPasswordMatch = await bcrypt.compare(
            loginData.password,
            doctor.password
        );

        if (!isPasswordMatch) {
            throw { status: 400, message: "Invalid email or password" };
        }
        const accessToken = this.tokenService.generateAccessToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            userId: doctor._id.toString(),
            email: doctor.email,
            role: loginData.role
        });

        const { password, ...safeUser } = doctor.toObject();
        return { user: safeUser, accessToken, refreshToken };
    }
    async getDoctorProfile(doctorId: string) {
        const doctor = await this.doctorRepo.findById(doctorId);
        if (!doctor) {
            throw { status: 404, message: "Doctor not found" };
        }
        return {
            ...doctor,
            role: "doctor"
        };
    }
  async updateDoctorProfile(id: string, updateData: any) {
    const existingDoctor = await this.doctorRepo.findById(id);
    if (!existingDoctor) throw { status: 404, message: "Doctor not found" };
    if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
      if (existingDoctor.profileImage) {
        await cloudinary.uploader.destroy(existingDoctor.profileImage);
      }
      const res = await cloudinary.uploader.upload(updateData.profileImage, {
        folder: 'doctors/profiles'
      });
      updateData.profileImage = res.secure_url;
      updateData.profileImagePublicId = res.public_id;
    }

    if (updateData.licenseImage && updateData.licenseImage.startsWith('data:image')) {
      if (existingDoctor.licence) {
        await cloudinary.uploader.destroy(existingDoctor.licence);
      }
      const res = await cloudinary.uploader.upload(updateData.licenseImage, {
        folder: 'doctors/licenses'
      });
      updateData.licence = res.secure_url;
      updateData.licensePublicId = res.public_id;
      delete updateData.licenseImage; 
    }

    return await this.doctorRepo.update(id, updateData);
  }
}
