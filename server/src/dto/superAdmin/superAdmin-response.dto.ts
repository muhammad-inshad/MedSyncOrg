import { z } from 'zod';

export const SuperAdminResponseSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    isActive: z.boolean(),
    role: z.literal("superadmin"),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type SuperAdminResponseDTO = z.infer<typeof SuperAdminResponseSchema>;
