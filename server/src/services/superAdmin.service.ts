import bcrypt from "bcryptjs";
import type { Request } from "express";
import { SuperAdminRepository } from "../repositories/superAdmin.repository.ts";
import { TokenService } from "./token.service.ts";
import { KycRepository } from "../repositories/superAdminKyc.repository.ts";

export class SuperAdminService {
  constructor(
    private readonly repo: SuperAdminRepository,
    private readonly tokenService: TokenService,
    private readonly kycRepo: KycRepository
  ) { }

  async login(email: string, password: string) {
    const superAdmin = await this.repo.findByEmailWithPassword(email);
    if (!superAdmin) {
      throw { status: 401, message: "Invalid credentials" };
    }
    const isMatch = await bcrypt.compare(password, superAdmin.password);
    if (!isMatch) {
      throw { status: 400, message: "password is not macth" };
    }

    const payload = {
      userId: superAdmin._id.toString(),
      email: superAdmin.email,
      role: "superadmin"
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: superAdmin._id,
        email: superAdmin.email,
        role: "superadmin",
      },
    };
  }

  async hospitalManagement(options: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = options;
    return await this.kycRepo.findWithPagination({
      page,
      limit,
      search,
      searchFields: ["hospitalName", "email", "_id"]
    });
  }

  async getme(id: string) {
    return await this.repo.findById(id)
  }

  async setActive(id: string, isActive: boolean) {
    const updatedHospital = await this.kycRepo.update(id, { isActive } as any);
    if (!updatedHospital) {
      throw { status: 500, message: "Failed to update hospital status" };
    }
    const hospitalObj = updatedHospital.toObject ? updatedHospital.toObject() : updatedHospital;
    const { password, ...safeData } = hospitalObj;
    return {
      ...safeData,
      message: `Hospital successfully ${isActive ? 'activated' : 'deactivated'}`
    };
  }
}