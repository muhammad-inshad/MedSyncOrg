import bcrypt from "bcrypt";
import type { LoginDTO, SignupDTO } from "../dto/auth/signup.dto.ts";
import { UserRepository } from "../repositories/user.repository.ts";
import type { IPatient } from "../model/user.model.ts";
import { TokenService } from "./token.service.ts";

export class AuthService {
  private userRepo: UserRepository;
  private tokenService!: TokenService;
  constructor(userRepo: UserRepository, tokenService: TokenService) {
    this.userRepo = userRepo;
    this.tokenService = tokenService;
  }

  async signup(signupData: SignupDTO): Promise<IPatient> {

    const existingUser = await this.userRepo.findByEmail(signupData.email);
    if (existingUser) {
      throw { code: 11000 };
    }

    const hashedPassword = await bcrypt.hash(signupData.password, 10);
    return this.userRepo.createUser({
      ...signupData,
      password: hashedPassword,
    });
  }
  async restPassword( restData: LoginDTO){
    const { email, password } = restData;
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw { status: 400, message: "User not found" };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await this.userRepo.updatePassword(email, hashedPassword);

    return { success: true, message: "Password updated successfully" };
  }
  async login(
    loginData: LoginDTO
  ): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findByEmail(loginData.email);

    if (!user) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordMatch) {
      throw { status: 400, message: "Invalid email or password" };
    }

    const accessToken = this.tokenService.generateAccessToken(
      user._id.toString(),
      user.email,
      loginData.role
    );

    const refreshToken = this.tokenService.generateRefreshToken(
      user._id.toString(),
      user.email,
      loginData.role
    );

    const { password, ...safeUser } = user.toObject();

    return { user: safeUser, accessToken, refreshToken };
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = this.tokenService.verifyRefreshToken(refreshToken);

    if (!decoded) {
      throw {
        status: 401,
        message: "Invalid or expired refresh token",
      };
    }

    const newAccessToken = this.tokenService.generateAccessToken(
      decoded.userId,
      decoded.email,
      decoded.role
    );

    return { accessToken: newAccessToken };
  }

}
