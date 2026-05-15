import { z } from 'zod';
export const CheckoutResponseSchema = z.object({
    url: z.string().nullable(),
});
