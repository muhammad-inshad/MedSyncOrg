import { QualificationResponseSchema } from "../dto/hospital/qualification-response.dto.js";
export class QualificationMapper {
    toDTO(qualification) {
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
