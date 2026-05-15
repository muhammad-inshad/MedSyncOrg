import { z } from "zod";
export const TokenPayloadSchema = z.object({
    userId: z.string(),
    email: z.string().email(),
    role: z.string(),
    doctorID: z.string().optional(),
});
export const RefreshTokenPayloadSchema = TokenPayloadSchema.extend({
    jti: z.string(),
});
