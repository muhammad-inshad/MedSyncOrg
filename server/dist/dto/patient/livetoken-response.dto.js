import { z } from 'zod';
export const LiveTokenResponseSchema = z.object({
    currentLiveToken: z.number(),
    patientTokenNumber: z.number(),
    doctorName: z.string(),
    appointmentId: z.string(),
});
