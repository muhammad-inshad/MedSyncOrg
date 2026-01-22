import bcrypt from "bcryptjs";
import type { Request } from "express";
import { SuperAdminRepository } from "../repository/superAdmin.repository.ts";
import { TokenService } from "../../auth/services/token.service.ts";
export class SuperAdminService {
  constructor(
    private readonly repo: SuperAdminRepository,
    private readonly tokenService: TokenService
  ) {}

  async login(email: string, password: string) {
    const superAdmin = await this.repo.findByEmail(email);
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

  async hospitalManagement() {
    return await this.repo.getAllHospital();
  }

  async getme(id:string){
    return await this.repo.findById(id)
  }

 async setActive(id: string, isActive: boolean) {
  const updatedHospital = await this.repo.updateById(id, isActive );
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