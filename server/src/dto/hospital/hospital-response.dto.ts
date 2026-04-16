import { z } from 'zod';

export const HospitalResponseSchema = z.object({
    id: z.string(),
    hospitalName: z.string(),
    address: z.string(),
    isActive: z.boolean(),
    autoDisabled: z.boolean(),
    email: z.string().email(),
    phone: z.string(),
    since: z.number(),
    pincode: z.string(),
    reapplyDate: z.union([z.date(), z.string()]).nullable().optional(),
logo: z.string().nullable().optional(),
licence: z.string().nullable().optional(),
about: z.string().nullable().optional(),
    income: z.number(),
    images: z.object({
        landscape: z.array(z.string()),
        medicalTeam: z.array(z.string()),
        patientCare: z.array(z.string()),
        services: z.array(z.string()),
    }),
    reviewStatus: z.enum(["pending", "approved", "revision", "rejected"]),
    rejectionReason: z.string().optional(),
    subscription: z.object({
        plan: z.string(),
        amount: z.number(),
        status: z.enum(["active", "expired", "cancelled"]),
        startDate: z.union([z.date(), z.string()]).optional(),
        endDate: z.union([z.date(), z.string()]).optional(),
        limits: z.object({
            maxPatients: z.number(),
            maxDoctors: z.number(),
            maxDepartments: z.number(),
        }).optional(),
    }),
    currentCounts: z.object({
        doctors: z.number(),
        patients: z.number(),
        departments: z.number(),
    }).optional(),
    createdAt: z.union([z.date(), z.string()]),
    updatedAt: z.union([z.date(), z.string()]),
});

export type HospitalResponseDTO = z.infer<typeof HospitalResponseSchema>;

export interface AuthHOspitalPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const DepartmentResponseSchema = z.object({
  _id: z.string(),
  departmentName: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  doctorCount: z.number().optional(),
});
export type DepartmentResponseDTO = z.infer<typeof DepartmentResponseSchema>;

export const QualificationResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  qualificationName: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
});
export type QualificationResponseDTO = z.infer<typeof QualificationResponseSchema>;

export const SpecializationResponseSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  department_id: z.string(),
});
export type SpecializationResponseDTO = z.infer<typeof SpecializationResponseSchema>;

export const SelectedHospitalSchema = z.object({
  _id: z.string(),
  hospitalName: z.string(),
  logo: z.string().optional(),
  address: z.string(),

  isActive: z.boolean(),
  autoDisabled: z.boolean(),

  images: z.object({
    landscape: z.array(z.string()),
    medicalTeam: z.array(z.string()),
    patientCare: z.array(z.string()),
    services: z.array(z.string()),
  }),

  email: z.string().email(),
  phone: z.string(),

  since: z.number(),
  pincode: z.string(),
  about: z.string().optional(),
  licence: z.string().optional(),

  subscription: z.object({
    plan: z.string(),
    amount: z.number(),
    status: z.enum(["active", "expired", "cancelled"]),
    startDate: z.union([z.date(), z.string()]).optional(),
    endDate: z.union([z.date(), z.string()]).optional(),
    limits: z.object({
      maxPatients: z.number(),
      maxDoctors: z.number(),
      maxDepartments: z.number(),
    }).optional(),
  }),
  currentCounts: z.object({
    doctors: z.number(),
    patients: z.number(),
    departments: z.number(),
  }).optional(),
  departments: z.array(DepartmentResponseSchema),
  qualifications: z.array(QualificationResponseSchema),
  specializations: z.array(SpecializationResponseSchema),
  totalDepartments: z.number(),
  currentPage: z.number(),
  totalPages: z.number(),
});

export type selectedHospitalDto = z.infer<typeof SelectedHospitalSchema>;


export const HospitalStatusUpdateResponseSchema = HospitalResponseSchema.extend({
    message: z.string(),
});
export type HospitalStatusUpdateResponseDTO = z.infer<typeof HospitalStatusUpdateResponseSchema>;

export const CreateHospitalSchema = z.object({
  hospitalName: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  address: z.string(),
  since: z.number().or(z.string()),
  pincode: z.string(),
  about: z.string().optional(),
  logo: z.string().optional(),
  licence: z.string().optional(),
  subscription: z.object({
    plan: z.string(),
    amount: z.number().optional(),
    status: z.enum(["active", "expired", "cancelled"]).optional(),
    startDate: z.union([z.date(), z.string()]).optional(),
    endDate: z.union([z.date(), z.string()]).optional(),
  }).optional(),
});
export type CreateHospitalDTO = z.infer<typeof CreateHospitalSchema>;

export const UpdateHospitalSchema = CreateHospitalSchema.partial().extend({
  isActive: z.boolean().optional(),
  images: z.any().optional(),
});
export type UpdateHospitalDTO = z.infer<typeof UpdateHospitalSchema>;