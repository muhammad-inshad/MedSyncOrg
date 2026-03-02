import { IMapper } from "../interfaces/mapper.interface.ts";
import { ISuperAdmin } from "../models/superAdmin.model.ts";
import { SuperAdminResponseDTO } from "../dto/superAdmin/superAdmin-response.dto.ts";

export class SuperAdminMapper implements IMapper<ISuperAdmin, SuperAdminResponseDTO> {
    toDTO(superAdmin: ISuperAdmin): SuperAdminResponseDTO {
        return {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            isActive: superAdmin.isActive,
            role: "superadmin",
            createdAt: superAdmin.createdAt,
            updatedAt: superAdmin.updatedAt,
        };
    }
}
