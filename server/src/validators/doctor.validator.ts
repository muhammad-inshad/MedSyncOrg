import { z } from 'zod';

export const doctorUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Doctor name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(1, 'Address is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    experience: z.string().min(1, 'Experience is required'),
    department: z.string().min(1, 'Department is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    about: z.string().min(1, 'About is required'),
    consultationTime: z.union([
      z.string(),
      z.object({
        start: z.string().min(1, 'Start time is required'),
        end: z.string().min(1, 'End time is required'),
      })
    ]).optional(),
    payment: z.union([
      z.string(),
      z.object({
        type: z.enum(['commission', 'fixed']),
        commissionPercentage: z.string().optional(),
        fixedSalary: z.string().optional(),
        payoutCycle: z.enum(['weekly', 'monthly']),
        patientsPerDayLimit: z.string()
            .min(1, 'Limit is required')
            .refine((val) => {
                const num = parseInt(val);
                return !isNaN(num) && num >= 1 && num <= 20;
            }, {
                message: "Maximum 20 patients per day allowed"
            }),
      })
    ]).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).refine((data) => {
      if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 6) return false;
      return true;
  }, {
      message: "New password must be at least 6 characters",
      path: ["newPassword"],
  }).refine((data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
  }, {
      message: "Current password is required to change password",
      path: ["currentPassword"],
  }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
  })
});

export const leaveSchema = z.object({
  body: z.object({
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    leaveSession: z.string().optional(),
    reason: z.string().optional(),
    photo: z.string().optional(), // For base64 encoded photo if sent via body
  }).refine(data => {
      if (data.startDate && data.endDate) {
          return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
  }, {
      message: 'End date must be after start date',
      path: ['endDate'],
  })
});

export const prescriptionSchema = z.object({
  body: z.object({
    medicines: z.array(
      z.object({
        name: z.string().min(2, "Medicine name must be at least 2 characters"),
        dosage: z.string().min(1, "Dosage is required"),
        duration: z.string().min(1, "Duration is required"),
      })
    ).min(1, "At least one medicine is required"),
    notes: z.string().optional(),
  })
});
