import { z } from 'zod';

export const subscriptionSchema = z.object({
  body: z.object({
    planName: z.string().min(1, 'Plan name is required.'),
    description: z.string().min(1, 'Description is required.'),
    duration: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(v => !isNaN(v) && v >= 1, 'Duration must be a positive number.'),
    durationUnit: z.enum(['months', 'years']),
    amount: z.union([z.string(), z.number()]).transform(v => Number(v)).refine(v => !isNaN(v) && v >= 0, 'Amount must be a positive number.'),
  })
});

export const hospitalEditSchema = z.object({
  body: z.object({
    hospitalName: z.string().min(1, 'Hospital name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(1, 'Phone is required'),
    pincode: z.string().min(1, 'Pincode is required'),
    address: z.string().min(1, 'Address is required'),
    since: z.union([z.string(), z.number()])
      .transform(v => Number(v))
      .refine(v => v >= 1900 && v <= new Date().getFullYear(), 'Invalid year'),
    about: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).optional(),
    logo: z.string().optional(),
    licence: z.string().optional(),
    subscription: z.string().optional(),
  })
});

export const patientEditSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
    fatherName: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).optional(),
    willRemoveImage: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).optional(),
  })
});
