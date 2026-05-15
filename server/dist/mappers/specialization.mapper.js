import { SpecializationResponseSchema } from "../dto/hospital/specialization-response.dto.js";
export class SpecializationMapper {
    toDTO(specialization) {
        const dto = {
            id: specialization._id.toString(),
            name: specialization.name,
            department_id: specialization.department_id.toString(),
            description: specialization.description,
            image: specialization.image,
            isActive: specialization.isActive,
        };
        return SpecializationResponseSchema.parse(dto);
    }
}
