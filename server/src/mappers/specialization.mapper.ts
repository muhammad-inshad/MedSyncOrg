import { IMapper } from "../interfaces/mapper.interface.ts";
import { ISpecialization } from "../models/specialization.model.ts";
import { SpecializationResponseDTO, SpecializationResponseSchema } from "../dto/hospital/specialization-response.dto.ts";

export class SpecializationMapper implements IMapper<ISpecialization, SpecializationResponseDTO> {
    toDTO(specialization: ISpecialization): SpecializationResponseDTO {
        const dto = {
            id: specialization._id.toString(),
            name: specialization.name,
            department_id: specialization.department_id.toString(),
            description: specialization.description,
            image: specialization.image,
            isActive: specialization.isActive,
        };
        // Output Validation using Zod
        return SpecializationResponseSchema.parse(dto);
    }
}
