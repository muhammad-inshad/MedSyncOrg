import { SuperAdminController } from "../modules/superAdmin/controller/superAdmin.controller.ts";
import { SuperAdminService } from "../modules/superAdmin/service/superAdmin.service.ts";
import { SuperAdminRepository } from "../modules/superAdmin/repository/superAdmin.repository.ts";
import { TokenService } from "../services/token.service.ts";

export const superAdminContainer = () => {
  const repo = new SuperAdminRepository();
  const tokenService = new TokenService();
  const service = new SuperAdminService(repo, tokenService);
  const controller = new SuperAdminController(service);

  return { controller };
};
