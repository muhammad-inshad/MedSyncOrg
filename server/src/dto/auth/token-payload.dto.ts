import { z } from "zod";

export const TokenPayloadSchema = z.object({
    userId: z.string(),
    email: z.string().email(),
    role: z.string(),
    doctorID: z.string().optional(),
});

export type ITokenPayload = z.infer<typeof TokenPayloadSchema>;

export const RefreshTokenPayloadSchema = TokenPayloadSchema.extend({
    jti: z.string(),
});

export type IRefreshTokenPayload = z.infer<typeof RefreshTokenPayloadSchema>;

export type IAccessTokenPayload = ITokenPayload;
