import { LiveTokenResponseSchema } from "../dto/patient/livetoken-response.dto.js";
export class LiveTokenMapper {
    toDTO(data) {
        // Output Validation using Zod
        return LiveTokenResponseSchema.parse(data);
    }
}
