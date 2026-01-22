import bcrypt from "bcrypt";
import type { LoginDTO, SignupDTO } from "../../../dto/auth/signup.dto.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import type { IPatient } from "../../../model/Patient.model.ts";
import { ITokenService } from "../interfaces/auth.types.ts"; 

export class AuthService {

  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenService: ITokenService 
  ) {}

  async signup(signupData: SignupDTO): Promise<IPatient> {
    const existingUser = await this.userRepo.findByEmail(signupData.email);
    if (existingUser) {
      throw { status: 400, message: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(signupData.password, 10);
    return this.userRepo.createUser({
      ...signupData,
      password: hashedPassword,
    });
  }

  async login(loginData: LoginDTO): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const payload = { 
      userId: user._id.toString(), 
      email: user.email, 
      role: loginData.role 
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    const { password, ...safeUser } = user.toObject ? user.toObject() : user;

    return { user: safeUser, accessToken, refreshToken };
  }

  async resetPassword(resetData: LoginDTO) {
    const user = await this.userRepo.findByEmail(resetData.email);
    if (!user) throw { status: 400, message: "User not found" };

    const hashedPassword = await bcrypt.hash(resetData.password, 10);
    await this.userRepo.updatePassword(resetData.email, hashedPassword);

    return { success: true, message: "Password updated successfully" };
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.tokenService.verifyRefreshToken(refreshToken);

    const newAccessToken = this.tokenService.generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    return { accessToken: newAccessToken };
  }
}