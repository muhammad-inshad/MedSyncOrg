import { DoctorRepository } from "../repositories/doctor.repository.ts";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.ts";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { TokenService } from "./token.service.ts";

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
        const doctorData = {
            name: body.name,
            email: body.email,
            password: hashedPassword,
            phone: body.phone,
            address: body.address,

            specialization: body.specialization,
            qualification: body.qualification,
            experience: body.experience,
            department: body.department,
            hospital_id: new Types.ObjectId(),
           
            about: body.about,
            licence: licenseUrl,
            profileImage: profileImageUrl,

            consultationTime: {
                start: `${body.timeStartHour}:${body.timeStartMinute} ${body.timeStartPeriod}`,
                end: `${body.timeEndHour}:${body.timeEndMinute} ${body.timeEndPeriod}`,
            },

            payment: {
                type: body.salaryType,
                payoutCycle: body.payoutCycle,
                patientsPerDayLimit: Number(body.patientsPerDay),
                ...(body.salaryType === "commission"
                    ? { commissionPercentage: Number(body.percentageOrSalary) }
                    : { fixedSalary: Number(body.percentageOrSalary) }),
            },
        };
        return this.doctorRepo.createDoctor(doctorData);
    }

    async loginDoctor(loginData:any)
     :Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const doctor = await this.doctorRepo.findByEmail(loginData.email);
     if(!doctor){
         throw { status: 400, message: "Invalid email or password" };
     }
    
      const isPasswordMatch = await bcrypt.compare(
           loginData.password,
           doctor.password
         );

         if (!isPasswordMatch) {
      throw { status: 400, message: "Invalid email or password" };
    }
     const accessToken = this.tokenService.generateAccessToken(
      doctor._id.toString(),
      doctor.email,
      loginData.role
    );

    const refreshToken = this.tokenService.generateRefreshToken(
      doctor._id.toString(),
      doctor.email,
      loginData.role
    );

    const { password, ...safeUser } = doctor.toObject();
    return { user: safeUser, accessToken, refreshToken };
    }
    
}
