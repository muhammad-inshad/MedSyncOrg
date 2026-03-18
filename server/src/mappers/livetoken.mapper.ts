import { LiveTokenResponseDTO, LiveTokenResponseSchema } from "../dto/patient/livetoken-response.dto.ts";

export class LiveTokenMapper {
    toDTO(data: {
        currentLiveToken: number;
        patientTokenNumber: number;
        doctorName: string;
        appointmentId: string;
    }): LiveTokenResponseDTO {
        // Output Validation using Zod
        return LiveTokenResponseSchema.parse(data);
    }
}
