import { LiveTokenResponseDTO } from "../../../dto/patient/livetoken-response.dto.ts";

export interface Igettoken {
    getPatientLiveToken(patientId: string, doctorId?: string): Promise<LiveTokenResponseDTO | null>;
}
