import { IAuthService } from "./auth.service.interface.ts";
import { SignupDTO, LoginDTO, PatientResponseDTO } from "../../dto/auth/signup.dto.ts";
import { IUserRepository } from "../../repositories/patient/user.repository.interface.ts";
import { ITokenService, UnifiedUser } from "../../interfaces/auth.types.ts";
import { AdminRepository } from "../../repositories/admin/admin.repository.ts";
import { DoctorRepository } from "../../repositories/doctor.repository.ts";
import bcrypt from "bcrypt";
import { IPatient } from "../../models/Patient.model.ts";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly adminRepo: AdminRepository,
    private readonly doctorRepo: DoctorRepository
  ) { }

  async signup(signupData: SignupDTO): Promise<PatientResponseDTO> {
    const existingUser = await this.userRepository.findByEmail(signupData.email);
    if (existingUser) {
      throw { status: 400, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(signupData.password, 10);
    const newUser = await this.userRepository.create({
      ...signupData,
      password: hashedPassword,
    });

    return this.mapToResponse(newUser);
  }

  async login(
    data: LoginDTO
  ): Promise<{ user: PatientResponseDTO; accessToken: string; refreshToken: string }> {
    let user: UnifiedUser | null = null;

    if (data.role === 'admin') {
      user = await this.adminRepo.findByEmail(data.email);
    } else if (data.role === 'doctor') {
      user = await this.doctorRepo.findByEmail(data.email);
    } else {
      user = await this.userRepository.findByEmail(data.email);
    }

    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }

    // Access password safely. All models (IPatient, IAdmin, IDoctor) have a password field.
    // However, since it is select: false in some, we need to be careful.
    // In our findByEmail implementation, we are NOT selecting password by default for privacy.
    // But for login, we need it. 
    // The previous implementation assumed findByEmail returns password or used findByEmailWithPassword for admin.
    // We should standardize this. For now, let's assuming strict typing on what we have.
    // We can cast to 'any' ONLY for the specific password check if the interface hides it, 
    // OR better, ensure our Repositories return a type that explicitly includes password when needed.
    // But to solve the immediate "any" usage on the user object:

    // Check if password exists (it might not if not selected)
    const userWithPassword = user as UnifiedUser & { password?: string };

    if (!userWithPassword.password) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(data.password, userWithPassword.password);
    if (!isPasswordValid) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const payload = {
      userId: (user as any)._id.toString(), // _id is common but sometimes hidden in types
      email: user.email,
      role: data.role,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      user: this.mapToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async resetPassword(email: string, pass: string, role: string): Promise<{ success: boolean; message: string }> {
    let repo: AdminRepository | DoctorRepository | IUserRepository;

    if (role === 'admin') {
      repo = this.adminRepo;
    } else if (role === 'doctor') {
      repo = this.doctorRepo;
    } else {
      repo = this.userRepository;
    }

    const user = await repo.findByEmail(email);
    if (!user) throw { status: 404, message: "User not found" };

    const hashedPassword = await bcrypt.hash(pass, 10);

    // We know user has _id.
    await repo.update((user as any)._id, { password: hashedPassword });

    return { success: true, message: "Password updated successfully" };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const newAccessToken = this.tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    return { accessToken: newAccessToken };
  }

  private mapToResponse(user: UnifiedUser): PatientResponseDTO {
    // Helper to safely access common properties
    const u = user as any;

    return {
      id: u._id.toString(),
      name: u.name || u.hospitalName || u.email,
      email: u.email,
      phone: u.phone,
      isGoogleAuth: u.isGoogleAuth || false,
      walletBalance: u.walletBalance || 0,
      medicalReports: u.medicalReports || [],
      appointmentHistory: u.appointmentHistory ? u.appointmentHistory.map((id: any) => id.toString()) : [],
      isProfileComplete: u.isProfileComplete || false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
