import { z } from 'zod';

export const TokenResponseSchema = z.object({
    accessToken: z.string(),
});

export type TokenResponseDTO = z.infer<typeof TokenResponseSchema>;
