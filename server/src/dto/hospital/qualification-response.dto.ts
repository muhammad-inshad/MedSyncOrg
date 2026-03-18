import { z } from 'zod';

export const QualificationResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    abbreviation: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean(),
});

export type QualificationResponseDTO = z.infer<typeof QualificationResponseSchema>;
