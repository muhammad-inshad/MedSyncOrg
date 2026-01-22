import { AdminController } from "../modules/admin/controller/admin.controller.ts";
import { AdminService } from "../modules/admin/service/admin.service.ts";
import { AdminRepository } from "../modules/admin/repositories/admin.repository.ts";
import { TokenService } from "../modules/auth/services/token.service.ts";
import { AdminModel } from "../model/admin.model.ts";

export const adminContainer = () => {
  const adminRepository = new AdminRepository(AdminModel);
  const tokenService = new TokenService(); 
  const adminService = new AdminService(
    adminRepository,
    tokenService
  );

  const adminController = new AdminController(adminService);

  return {
    adminController,
    adminService,
    adminRepository
  };
};
