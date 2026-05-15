import { z } from 'zod';
export const DepartmentResponseSchema = z.object({
    id: z.string(),
    departmentName: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean(),
});
