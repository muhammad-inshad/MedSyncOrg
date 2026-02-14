import { generateOtp } from "../utils/otp/otp.util.ts";
import { OtpData } from "../utils/otp/otp.Store.ts";
import { EmailService } from "./email.service.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import { AdminRepository } from "../repositories/admin.repository.ts";
import { DoctorRepository } from "../repositories/doctor.repository.ts";

export class OtpService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly store: Map<string, OtpData>,
    private readonly emailService: EmailService,
    private readonly adminRepo: AdminRepository,
    private readonly doctorRepo: DoctorRepository
  ) { }

  async sendOtp(email: string, purpose: string, role: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (purpose === "forgot-password" || purpose === "chackit") {
      let existingUser = null;

      if (role === "doctor") {
        existingUser = await this.doctorRepo.findByEmail(cleanEmail);
      } else if (role === "patient") {
        existingUser = await this.userRepo.findByEmail(cleanEmail);
      } else if (role === "admin") {
        existingUser = await this.adminRepo.findByEmail(cleanEmail);
      }

      if (!existingUser) {
        throw { status: 404, message: `No ${role} found with this email address` };
      }
    }

    const otp = generateOtp();
    console.log(`OTP for ${cleanEmail}: ${otp}`);

    this.store.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 60 * 1000,
    });

    return await this.emailService.sendOtpEmail(cleanEmail, otp);
  }

  verifyOtp(email: string, userOtp: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const stored = this.store.get(cleanEmail);

    if (!stored) {
      return { success: false, message: "No OTP request found for this email" };
    }

    if (stored.expiresAt < Date.now()) {
      this.store.delete(cleanEmail);
      return { success: false, message: "OTP has expired" };
    }

    if (stored.otp !== userOtp) {
      return { success: false, message: "Invalid OTP code" };
    }
    this.store.delete(cleanEmail);
    return { success: true, message: "Verified" };
  }
}