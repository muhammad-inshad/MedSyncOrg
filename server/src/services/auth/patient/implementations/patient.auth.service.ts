import bcrypt from "bcrypt";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { IAdminRepository } from "../../../../repositories/admin/admin.repository.interface.ts";
import { DoctorRepository } from "../../../../repositories/doctor.repository.ts";
import { LoginDTO, PatientResponseDTO, SignupDTO } from "../../../../dto/auth/signup.dto.ts";
import { IPatientAuthService } from "../interfaces/patient.auth.service.interface.ts";
import { ITokenService, AuthResponse } from "../../../../interfaces/auth.types.ts";
import { IPatient } from "../../../../models/Patient.model.ts";
import { HttpStatusCode } from "../../../../constants/httpStatus.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { MESSAGES } from "../../../../constants/messages.ts";

export class PatientAuthService implements IPatientAuthService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
    private readonly _adminRepo: IAdminRepository,
    private readonly _doctorRepo: DoctorRepository,
  ) { }

  async signup(signupData: SignupDTO): Promise<PatientResponseDTO> {
    const existingUser = await this._userRepository.findByEmail(signupData.email);
    if (existingUser) {
      ApiResponse.throwError(HttpStatusCode.BAD_REQUEST, MESSAGES.AUTH.ALREADY_EXISTS);
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
  ): Promise<AuthResponse> {
    const user = await this._userRepository.findByEmail(data.email);

    if (!user) {
      ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
    }

    if (!user?.password) {
      ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user!.password!);
    if (!isPasswordValid) {
      ApiResponse.throwError(HttpStatusCode.UNAUTHORIZED, MESSAGES.AUTH.LOGIN_FAILED);
    }

    const payload = {
      userId: user!._id.toString(),
      email: user!.email,
      role: data.role,
    };

    const accessToken = this._tokenService.generateAccessToken(payload);
    const refreshToken = this._tokenService.generateRefreshToken(payload);

    return {
      user: this.mapToResponse(user!),
      accessToken,
      refreshToken,
    };
  }

  async resetPassword(email: string, pass: string, role: string): Promise<{ success: boolean; message: string }> {
    let user = null;
    let repo: any = this._userRepository; // default to patient

    if (role === 'admin') {
      repo = this._adminRepo;
    } else if (role === 'doctor') {
      repo = this._doctorRepo;
    }

    user = await repo.findByEmail(email);

    if (!user) ApiResponse.throwError(HttpStatusCode.NOT_FOUND, MESSAGES.PATIENT.NOT_FOUND);

    const hashedPassword = await bcrypt.hash(pass, 10);

    await repo.update(user!._id.toString(), { password: hashedPassword });

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

  private mapToResponse(user: IPatient): PatientResponseDTO {
    const u = user;

    return {
      id: u._id.toString(),
      name: u.name || u.email,
      email: u.email,
      phone: u.phone,
      isGoogleAuth: u.isGoogleAuth || false,
      walletBalance: u.walletBalance || 0,
      medicalReports: u.medicalReports || [],
      appointmentHistory: u.appointmentHistory ? u.appointmentHistory.map((id: { toString(): string }) => id.toString()) : [],
      isProfileComplete: u.isProfileComplete || false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      image: u.image,
      bloodGroup: u.bloodGroup,
      gender: u.gender,
      dateOfBirth: u.dateOfBirth,
      address: u.address
    };
  }
}

