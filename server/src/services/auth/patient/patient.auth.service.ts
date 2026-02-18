import bcrypt from "bcrypt";
import { IUserRepository } from "../../../repositories/patient/user.repository.interface.ts";
import { LoginDTO, PatientResponseDTO, SignupDTO } from "../../../dto/auth/signup.dto.ts";
import { IPatientAuthService } from "./patient.auth.service.interface.ts";
import { ITokenService, UnifiedUser } from "../../../interfaces/auth.types.ts";

export class PatientAuthService implements IPatientAuthService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
  ) { }

  async signup(signupData: SignupDTO): Promise<PatientResponseDTO> {
    const existingUser = await this._userRepository.findByEmail(signupData.email);
    if (existingUser) {
      throw { status: 400, message: "User already exists" };
    }

    const hashedPassword = await bcrypt.hash(signupData.password, 10);
    const newUser = await this._userRepository.create({
      ...signupData,
      password: hashedPassword,
    });

    return this.mapToResponse(newUser);
  }

  async login(
    data: LoginDTO
  ): Promise<{ user: PatientResponseDTO; accessToken: string; refreshToken: string }> {
    let user: UnifiedUser | null = null;

      user = await this._userRepository.findByEmail(data.email);
   
    if (!user) {
      throw { status: 401, message: "Invalid credentials" };
    }
    const userWithPassword = user as UnifiedUser & { password?: string };

    if (!userWithPassword.password) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const isPasswordValid = await bcrypt.compare(data.password, userWithPassword.password);
    if (!isPasswordValid) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const payload = {
      userId: (user as any)._id.toString(), 
      email: user.email,
      role: data.role,
    };

    const accessToken = this._tokenService.generateAccessToken(payload);
    const refreshToken = this._tokenService.generateRefreshToken(payload);

    return {
      user: this.mapToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async resetPassword(email: string, pass: string, role: string): Promise<{ success: boolean; message: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) throw { status: 404, message: "User not found" };

    const hashedPassword = await bcrypt.hash(pass, 10);

    await this._userRepository.update((user as any)._id, { password: hashedPassword });

    return { success: true, message: "Password updated successfully" };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this._tokenService.verifyRefreshToken(refreshToken);
    const newAccessToken = this._tokenService.generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    });
    return { accessToken: newAccessToken };
  }

  private mapToResponse(user: UnifiedUser): PatientResponseDTO {
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
