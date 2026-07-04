import { z } from 'zod';

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
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    about: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).optional(),
    logo: z.string().optional(),
    licence: z.string().optional(),
    subscription: z.string().optional(), // Often stringified JSON
    images: z.string().optional(), // Often stringified JSON
  }).refine((data) => {
    if (data.password) {
      if (data.password.length < 6) return false;
      if (data.password !== data.confirmPassword) return false;
    }
    return true;
  }, {
    message: "Password validation failed",
    path: ["password"]
  })
});

export const addPatientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    fatherName: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', '']).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    bloodGroup: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).transform(v => v === 'true' || v === true).optional(),
    image: z.string().optional(),
  })
});

export const addDoctorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Doctor name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(1, 'Address is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    experience: z.string().min(1, 'Experience is required'),
    department: z.string().min(1, 'Department is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    about: z.string().min(1, 'About is required'),
    profileImage: z.string().optional(),
    license: z.string().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
});
