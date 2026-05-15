import { z } from 'zod';
export const OtpResponseSchema = z.object({
    otp: z.string(),
    expiresAt: z.number(),
});
