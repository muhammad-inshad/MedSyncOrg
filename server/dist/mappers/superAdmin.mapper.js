import { SuperAdminResponseSchema } from "../dto/superAdmin/superAdmin-response.dto.js";
export class SuperAdminMapper {
    toDTO(superAdmin) {
        const dto = {
            id: superAdmin._id.toString(),
            email: superAdmin.email,
            isActive: superAdmin.isActive,
            role: "superadmin",
            createdAt: superAdmin.createdAt,
            updatedAt: superAdmin.updatedAt,
        };
        return SuperAdminResponseSchema.parse(dto);
    }
}
