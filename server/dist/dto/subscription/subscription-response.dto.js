import { z } from 'zod';
export const SubscriptionResponseSchema = z.object({
    id: z.string(),
    amount: z.number(),
    status: z.enum(["active", "expired", "cancelled"]),
    planName: z.string(),
    duration: z.number().optional(),
    durationUnit: z.enum(["months", "years"]).optional(),
    description: z.string().optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    endDate: z.union([z.string(), z.date()]).optional(),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
});
export const CreateSubscriptionSchema = z.object({
    planName: z.string(),
    description: z.string().optional(),
    price: z.number(),
    duration: z.number(),
    durationUnit: z.enum(["days", "months", "years"]),
    features: z.array(z.string()).optional(),
    planType: z.enum(["Basic", "Standard", "Premium", "Enterprise"]).optional(),
    limits: z.object({
        maxPatients: z.number(),
        maxDoctors: z.number(),
        maxDepartments: z.number(),
    }),
    isActive: z.boolean().optional(),
});
export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();
