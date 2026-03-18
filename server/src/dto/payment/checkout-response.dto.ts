import { z } from 'zod';

export const CheckoutResponseSchema = z.object({
    url: z.string().nullable(),
});

export type CheckoutResponseDTO = z.infer<typeof CheckoutResponseSchema>;
