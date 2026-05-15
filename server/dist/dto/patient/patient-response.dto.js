import { z } from 'zod';
export const PatientResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    phone: z.number().nullable().optional(),
    isGoogleAuth: z.boolean(),
    fatherName: z.string().nullable().optional(),
    gender: z.enum(["male", "female", "other"]).nullable().optional(),
    dateOfBirth: z.union([z.date(), z.string()]).nullable().optional(),
    address: z.string().nullable().optional(),
    isActive: z.boolean().optional(),
    image: z.string().nullable().optional(),
    bloodGroup: z.string().nullable().optional(),
    walletBalance: z.number(),
    medicalReports: z.array(z.string()),
    hospital_id: z.string().optional().nullable(),
    appointmentHistory: z.array(z.string()),
    isProfileComplete: z.boolean(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
    age: z.number().optional()
});
export const CreatePatientSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.number().optional(),
    password: z.string().optional(),
    fatherName: z.string().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    dateOfBirth: z.union([z.date(), z.string()]).optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    age: z.number().optional(),
    image: z.string().optional(),
});
export const UpdatePatientSchema = CreatePatientSchema.partial().extend({
    willRemoveImage: z.boolean().or(z.string()).optional(),
    isActive: z.boolean().optional(),
});
