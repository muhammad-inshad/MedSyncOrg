import { z } from 'zod';

export const SpecializationResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    department_id: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean(),
});

export type SpecializationResponseDTO = z.infer<typeof SpecializationResponseSchema>;
