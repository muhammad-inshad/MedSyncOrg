import { IMapper } from "../interfaces/mapper.interface.js";
import { ISuperAdmin } from "../models/superAdmin.model.js";
import { SuperAdminResponseDTO, SuperAdminResponseSchema } from "../dto/superAdmin/superAdmin-response.dto.js";

export class SuperAdminMapper implements IMapper<ISuperAdmin, SuperAdminResponseDTO> {
    toDTO(superAdmin: ISuperAdmin): SuperAdminResponseDTO {
        const dto = {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            isActive: superAdmin.isActive,
            role: "superadmin" as const,
            createdAt: superAdmin.createdAt || new Date(),
            updatedAt: superAdmin.updatedAt || new Date(),
        };

        return SuperAdminResponseSchema.parse(dto);
    }
}
