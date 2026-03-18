import { IMapper } from "../interfaces/mapper.interface.ts";
import { ISuperAdmin } from "../models/superAdmin.model.ts";
import { SuperAdminResponseDTO, SuperAdminResponseSchema } from "../dto/superAdmin/superAdmin-response.dto.ts";

export class SuperAdminMapper implements IMapper<ISuperAdmin, SuperAdminResponseDTO> {
    toDTO(superAdmin: ISuperAdmin): SuperAdminResponseDTO {
        const dto = {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            isActive: superAdmin.isActive,
            role: "superadmin" as const,
            createdAt: superAdmin.createdAt,
            updatedAt: superAdmin.updatedAt,
        };

        return SuperAdminResponseSchema.parse(dto);
    }
}
