import { z } from 'zod';
export const TokenResponseSchema = z.object({
    accessToken: z.string(),
});
