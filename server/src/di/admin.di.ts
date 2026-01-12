import { AdminController } from "../controllers/admin.controller.ts";
import { AdminService } from "../services/admin.service.ts";
import { AdminRepository } from "../repositories/admin.repository.ts";
import { TokenService } from "../services/token.service.ts";

export const adminContainer = () => {
  const adminRepository = new AdminRepository();
  const tokenService = new TokenService(); 
  const adminService = new AdminService(
    adminRepository,
    tokenService
  );

  const adminController = new AdminController(adminService);

  return {
    adminController,
  };
};
