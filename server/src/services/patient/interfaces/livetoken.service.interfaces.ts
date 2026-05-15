import { LiveTokenResponseDTO } from "../../../dto/patient/livetoken-response.dto.js";

export interface Igettoken {
    getPatientLiveToken(patientId: string, doctorId?: string): Promise<LiveTokenResponseDTO | null>;
}
