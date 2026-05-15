import { IMapper } from "../interfaces/mapper.interface.js";
import { ISpecialization } from "../models/specialization.model.js";
import { SpecializationResponseDTO, SpecializationResponseSchema } from "../dto/hospital/specialization-response.dto.js";

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
        return SpecializationResponseSchema.parse(dto);
    }
}
