import { z } from 'zod';
export const DoctorLeaveResponseSchema = z.object({
    id: z.string(),
    doctorId: z.union([
        z.string(),
        z.object({
            _id: z.string(),
            name: z.string(),
            email: z.string(),
            profileImage: z.string(),
            specialization: z.string().optional(),
            department: z.string().optional(),
        })
    ]),
    startDate: z.union([z.date(), z.string()]),
    endDate: z.union([z.date(), z.string()]),
    leaveSession: z.enum(["morning", "afternoon", "evening", "night"]).optional(),
    reason: z.string().optional(),
    photo: z.string().optional(),
    rejectedReson: z.string().optional(),
    status: z.enum(["approved", "pending", "rejected"]),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});
