import { z } from 'zod';
import { AppointmentStatus, AppointmentMode } from '../../models/appointment.ts';

export const AppointmentResponseSchema = z.object({
    id: z.string(),
    patientName: z.string(),
    patientAge: z.number(),
    patientPhone: z.string(),
    patientEmail: z.string().optional().nullable(),
    patientAddress: z.string().optional().nullable(),
    patientImage: z.string().optional().nullable(),
    appointmentDate: z.string(), 
    visitTime: z.string().optional().nullable(),
    status: z.nativeEnum(AppointmentStatus),
    mode: z.nativeEnum(AppointmentMode),
    
    // Doctor Details - Added these fields
    doctorId: z.string(),
    doctorName: z.string().optional(),
    doctorProfileImage: z.string().optional().nullable(),
    doctorSpecialization: z.string().optional(),
    doctorDepartment: z.string().optional(),

    tokenNumber: z.number(),
    prescription: z.object({
        medicines: z.array(z.object({
            name: z.string(),
            dosage: z.string(),
            duration: z.string(),
        })),
        notes: z.string().optional(),
        prescribedAt: z.string().optional(),
    }).optional(),
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    weight: z.string().optional(),
    cancelReason: z.string().optional().nullable(),
    session: z.enum(["morning", "afternoon", "evening"]).optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    rejectionReason: z.string().optional().nullable(),
});

export type AppointmentResponseDTO = z.infer<typeof AppointmentResponseSchema>;