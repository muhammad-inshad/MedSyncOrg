import { z } from 'zod';
export const PrescriptionResponseSchema = z.object({
    id: z.string(),
    patient_email: z.string(),
    doctor_id: z.object({
        id: z.string(),
        name: z.string(),
        profileImage: z.string().optional(),
        specialization: z.string().optional(),
    }),
    hospital_id: z.object({
        id: z.string(),
        name: z.string(),
        logo: z.string().optional(),
        address: z.string().optional(),
    }),
    appointment_id: z.string().optional(),
    medicines: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        duration: z.string(),
    })),
    notes: z.string().optional(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});
