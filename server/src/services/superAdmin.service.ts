import bcrypt from "bcryptjs";
import type { Request } from "express";
import { SuperAdminRepository } from "../repositories/superAdmin.repository.ts";
import { TokenService } from "./token.service.ts";

export class SuperAdminService {
  private repo: SuperAdminRepository;
  private tokenService: TokenService;

  constructor(repo: SuperAdminRepository, tokenService: TokenService) {
    this.repo = repo;
    this.tokenService = tokenService;
  }

  async login(req: Request) {
    const { email, password } = req.body;

    const superAdmin = await this.repo.findByEmail(email);
    
    if (!superAdmin) {
      throw { status: 401, message: "Invalid credentials" };
    }
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      throw { status: 401, message: "Invalid credentials" };
    }

    const accessToken = this.tokenService.generateAccessToken(
      superAdmin._id.toString(),
      superAdmin.email,
      "superadmin"
    );

    const refreshToken = this.tokenService.generateRefreshToken(
      superAdmin._id.toString(),
      superAdmin.email,
      "superadmin"
    );

    return {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        role: "superadmin",
      },
    };
  }

  async hospitalManagement() {
    const hospitals = await this.repo.getAllHospital();
    return hospitals;
  }
}
