import { SuperAdminController } from "../controllers/superAdmin.controller.ts";
import { SuperAdminService } from "../services/superAdmin.service.ts";
import { SuperAdminRepository } from "../repositories/superAdmin.repository.ts";
import { TokenService } from "../services/token.service.ts";
import { SuperAdminModel } from "../models/superAdmin.model.ts";
import { Superadminkyc } from "../controllers/superAdminkyc.controller.ts";
import { SuperadminkycService } from "../services/superAdminkyc.service.ts";
import { KycRepository } from "../repositories/superAdminKyc.repository.ts";
import { AdminModel } from "../models/admin.model.ts"; // Import the Admin Model
export const superAdminContainer = () => {
    const repo = new SuperAdminRepository(SuperAdminModel);
    const tokenService = new TokenService();
    const kycRepo = new KycRepository(AdminModel);
    const service = new SuperAdminService(repo, tokenService, kycRepo);
    const controller = new SuperAdminController(service);
    const kycservice = new SuperadminkycService(kycRepo);
    const kyccontroller = new Superadminkyc(kycservice);
    return { controller, kyccontroller };
};
