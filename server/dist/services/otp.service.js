import { generateOtp } from "../utils/otp/otp.util.ts";
export class OtpService {
    constructor(userRepo, store, emailService, adminRepo, doctorRepo) {
        this.userRepo = userRepo;
        this.store = store;
        this.emailService = emailService;
        this.adminRepo = adminRepo;
        this.doctorRepo = doctorRepo;
    }
    async sendOtp(email, purpose, role) {
        const cleanEmail = email.trim().toLowerCase();
        if (purpose === "forgot-password" || purpose === "chackit") {
            let existingUser = null;
            if (role === "doctor") {
                existingUser = await this.doctorRepo.findByEmail(cleanEmail);
            }
            else if (role === "patient") {
                existingUser = await this.userRepo.findByEmail(cleanEmail);
            }
            else if (role === "admin") {
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
    verifyOtp(email, userOtp) {
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
