import { generateOtp } from "../../../../utils/otp/otp.util.ts";
import { UserRepository } from "../../../../repositories/patient/user.repository.ts";
import { DoctorRepository } from "../../../../repositories/doctor.repository.ts";
import { IPatientOtpAuthService } from "../interfaces/otp.auth.service.interface.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { IEmailService } from "../interfaces/email.otp.interface.ts";
import { IAdminRepository } from "../../../../repositories/admin/admin.repository.interface.ts";
import { IOtpRepository } from "../../../../repositories/otp/otp.repository.interface.ts";

export class OtpService implements IPatientOtpAuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly otpRepository: IOtpRepository,
    private readonly emailService: IEmailService,
    private readonly adminRepo: IAdminRepository,
    private readonly doctorRepo: DoctorRepository
  ) { }

  async sendOtp(email: string, purpose: string, role: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    let existingUser = null;
    console.log(role)
    if (role === "doctor") {
      existingUser = await this.doctorRepo.findByEmail(cleanEmail);
    } else if (role === "patient") {
      existingUser = await this.userRepo.findByEmail(cleanEmail);
    } else if (role === "admin") {
      existingUser = await this.adminRepo.findByEmail(cleanEmail);
    }

    if (purpose === "forgot-password") {
      if (!existingUser) {
        ApiResponse.throwError(HttpStatusCode.NOT_FOUND, `No ${role} found with this email address`);
      }
    } else if (purpose === "signup") {
      if (existingUser) {
        ApiResponse.throwError(HttpStatusCode.CONFLICT, MESSAGES.AUTH.ALREADY_EXISTS);
      }
    }

    const otp = generateOtp();
    console.log(`OTP for ${cleanEmail}: ${otp}`);

    await this.otpRepository.saveOtp(cleanEmail, otp);

    await this.emailService.sendOtpEmail(cleanEmail, otp);
  }

  async verifyOtp(email: string, userOtp: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();

    const storedOtp = await this.otpRepository.getOtpByEmail(cleanEmail);

    if (!storedOtp) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "No OTP request found for this email or OTP expired");
    }

    if (storedOtp.otp !== userOtp) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, "Invalid OTP code");
    }
    await this.otpRepository.deleteOtpByEmail(cleanEmail);
  }
}
