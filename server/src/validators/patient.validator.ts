import { z } from 'zod';

export const patientProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.union([z.string(), z.number()])
      .transform((val) => val.toString())
      .refine((val) => /^\d{10}$/.test(val), 'Phone must be 10 digits'),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
    // Additional fields that might be sent in the profile payload
    fatherName: z.string().optional(),
    gender: z.string().optional(),
    dateOfBirth: z.union([z.string(), z.date()]).optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    age: z.union([z.string(), z.number()]).optional(),
    willRemoveImage: z.boolean().optional(),
    image: z.string().optional(),
  }).refine((data) => {
    if (data.currentPassword || data.newPassword || data.confirmNewPassword) {
      if (!data.currentPassword) return false;
      if (data.newPassword && data.newPassword.length < 6) return false;
      if (data.newPassword !== data.confirmNewPassword) return false;
    }
    return true;
  }, {
    message: "Password validation failed",
    path: ["currentPassword"] 
  })
});
