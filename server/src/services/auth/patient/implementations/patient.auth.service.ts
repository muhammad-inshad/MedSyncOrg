import bcrypt from "bcrypt";
import { IUserRepository } from "../../../../repositories/patient/user.repository.interface.ts";
import { IHospitalRepository } from "../../../../repositories/hospital/hospital.repository.interface.ts";
import { IDoctorRepository } from "../../../../repositories/doctor/doctor.repository.interface.ts";
import { LoginDTO, SignupDTO } from "../../../../dto/auth/signup.dto.ts";
import { PatientResponseDTO } from "../../../../dto/patient/patient-response.dto.ts";
import { IPatientAuthService } from "../interfaces/patient.auth.service.interface.ts";
import { ITokenService } from "../../../token/token.service.interface.ts";
import { AuthResponse } from "../../../../interfaces/auth.types.ts";
import { IPatient } from "../../../../models/Patient.model.ts";
import { HttpStatusCode } from "../../../../constants/enums.ts";
import { ApiResponse } from "../../../../utils/apiResponse.utils.ts";
import { MESSAGES } from "../../../../constants/messages.ts";
import { PatientMapper } from "../../../../mappers/patient.mapper.ts";

export class PatientAuthService implements IPatientAuthService {
  constructor(
    private readonly _userRepository: IUserRepository,
    private readonly _tokenService: ITokenService,
    private readonly _hospitalRepo: IHospitalRepository,
    private readonly _doctorRepo: IDoctorRepository,
    private readonly _patientMapper: PatientMapper
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
    let repo: IUserRepository | IHospitalRepository | IDoctorRepository = this._userRepository;

    if (role === 'hospital') {
      repo = this._hospitalRepo;
    } else if (role === 'doctor') {
      repo = this._doctorRepo as unknown as IDoctorRepository;
    }

    const user = await repo.findByEmail(email);

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
    return this._patientMapper.toDTO(user);
  }
}
