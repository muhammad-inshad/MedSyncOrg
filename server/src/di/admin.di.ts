import { AdminController } from "../modules/admin/controller/admin.controller.ts";
import { AdminService } from "../modules/admin/service/admin.service.ts";
import { AdminRepository } from "../modules/admin/repositories/admin.repository.ts";
import { TokenService } from "../modules/auth/services/token.service.ts";
import { AdminModel } from "../model/admin.model.ts";
import { AdminManagementController } from "../modules/admin/controller/AdminManagement.Controller.ts";
import { AdminManagementService } from "../modules/admin/service/adminManagement.service.ts";
import { DoctorRepository } from "../modules/doctor/repository/doctor.repository.ts";
import { DoctorModel } from "../model/doctor.model.ts";

export const adminContainer = () => {
  const adminRepository = new AdminRepository(AdminModel);
  const tokenService = new TokenService();
  const doctorRepository = new DoctorRepository(DoctorModel);
  const adminService = new AdminService(
    adminRepository,
    tokenService
  );

  const adminManagementService = new AdminManagementService(
    adminRepository,
    tokenService,
    doctorRepository
  );

  const adminController = new AdminController(adminService);

  const adminManagementController = new AdminManagementController(
    adminManagementService
  );

  return {
    adminController,
    adminManagementController,
    adminService,
    adminManagementService,
    adminRepository
  };
};
