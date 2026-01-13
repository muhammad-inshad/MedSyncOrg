import { AdminController } from "../modules/admin/controller/admin.controller.ts";
import { AdminService } from "../modules/admin/service/admin.service.ts";
import { AdminRepository } from "../modules/admin/repositories/admin.repository.ts";
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
