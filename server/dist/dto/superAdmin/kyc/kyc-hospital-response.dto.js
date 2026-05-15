import { z } from 'zod';
export const KycHospitalResponseSchema = z.object({
    id: z.string(),
    hospitalName: z.string(),
    email: z.string().email(),
    phone: z.string(),
    since: z.number(),
    licence: z.string().optional(),
    address: z.string(),
    reviewStatus: z.enum(["pending", "approved", "revision", "rejected"]),
    createdAt: z.union([z.date(), z.string()]),
});
