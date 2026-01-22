import { SuperAdminController } from "../modules/superAdmin/controller/superAdmin.controller.ts";
import { SuperAdminService } from "../modules/superAdmin/service/superAdmin.service.ts";
import { SuperAdminRepository } from "../modules/superAdmin/repository/superAdmin.repository.ts";
import { TokenService } from "../modules/auth/services/token.service.ts";
import { SuperAdminModel } from "../model/superAdmin.model.ts"; 

export const superAdminContainer = () => {
  const repo = new SuperAdminRepository(SuperAdminModel);
  const tokenService = new TokenService();
  const service = new SuperAdminService(repo, tokenService);
  const controller = new SuperAdminController(service);

  return { controller };
};