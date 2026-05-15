import { IMapper } from "../interfaces/mapper.interface.js";
import { IQualification } from "../models/qualification.model.js";
import { QualificationResponseDTO, QualificationResponseSchema } from "../dto/hospital/qualification-response.dto.js";

export class QualificationMapper implements IMapper<IQualification, QualificationResponseDTO> {
    toDTO(qualification: IQualification): QualificationResponseDTO {
        const dto = {
            id: qualification._id.toString(),
            name: qualification.name,
             abbreviation: qualification.abbreviation ?? "",
        description: qualification.description ?? "",
        image: qualification.image ?? "",
            isActive: qualification.isActive,
        };
        // Output Validation using Zod
        return QualificationResponseSchema.parse(dto);
    }
}
