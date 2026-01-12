import { SuperAdminController } from "../controllers/superAdmin.controller.ts";
import { SuperAdminService } from "../services/superAdmin.service.ts";
import { SuperAdminRepository } from "../repositories/superAdmin.repository.ts";
import { TokenService } from "../services/token.service.ts";

export const superAdminContainer = () => {
  const repo = new SuperAdminRepository();
  const tokenService = new TokenService();
  const service = new SuperAdminService(repo, tokenService);
  const controller = new SuperAdminController(service);

  return { controller };
};
