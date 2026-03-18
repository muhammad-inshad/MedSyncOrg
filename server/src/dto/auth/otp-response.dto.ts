import { z } from 'zod';

export const OtpResponseSchema = z.object({
    otp: z.string(),
    expiresAt: z.number(),
});

export type OtpResponseDTO = z.infer<typeof OtpResponseSchema>;
