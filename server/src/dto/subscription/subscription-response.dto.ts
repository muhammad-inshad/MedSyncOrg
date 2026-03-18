import { z } from 'zod';

export const SubscriptionResponseSchema = z.object({
    id: z.string(),
    plan: z.string(),
    amount: z.number(),
    status: z.enum(["active", "expired", "cancelled"]),
    startDate: z.union([z.date(), z.string()]).optional(),
    endDate: z.union([z.date(), z.string()]).optional(),
    planName: z.string().optional(),
    price: z.number().optional(),
    duration: z.number().optional(),
    durationUnit: z.enum(["days", "months", "years"]).optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    planType: z.enum(["Basic", "Standard", "Premium", "Enterprise"]).optional(),
    description: z.string().optional(),
    limits: z.object({
        maxPatients: z.number(),
        maxDoctors: z.number(),
        maxDepartments: z.number(),
    }).optional(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type SubscriptionResponseDTO = z.infer<typeof SubscriptionResponseSchema>;

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

export type CreateSubscriptionDTO = z.infer<typeof CreateSubscriptionSchema>;

export const UpdateSubscriptionSchema = CreateSubscriptionSchema.partial();

export type UpdateSubscriptionDTO = z.infer<typeof UpdateSubscriptionSchema>;
