import { z } from 'zod';
import { AUTH_MESSAGES } from '../constants/frontend.messages.ts';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, AUTH_MESSAGES.LOGIN.EMAIL_REQUIRED),
    password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    role: z.string().optional(),
  })
});

export const patientSignupSchema = z.object({
  body: z.object({
    name: z.string().min(3, AUTH_MESSAGES.SIGNUP.NAME_MIN_LENGTH),
    email: z.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    phone: z.string().regex(/^[0-9]{10}$/, AUTH_MESSAGES.SIGNUP.PHONE_TEN_DIGITS),
    password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    confirmPassword: z.string().min(6, AUTH_MESSAGES.SIGNUP.CONFIRM_PASSWORD_REQUIRED),
  }).refine((data) => data.password === data.confirmPassword, {
    message: AUTH_MESSAGES.COMMON.PASSWORDS_NOT_MATCH,
    path: ["confirmPassword"],
  })
});

export const doctorSignupSchema = z.object({
  body: z.object({
    name: z.string().min(1, AUTH_MESSAGES.SIGNUP.DOCTOR_NAME_REQUIRED),
    email: z.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
    phone: z.string().min(10, AUTH_MESSAGES.SIGNUP.HOSPITAL_PHONE_MIN),
    address: z.string().min(1, AUTH_MESSAGES.SIGNUP.ADDRESS_REQUIRED),
    qualification: z.string().min(1, AUTH_MESSAGES.SIGNUP.QUALIFICATION_REQUIRED),
    experience: z.string().min(1, AUTH_MESSAGES.SIGNUP.EXPERIENCE_REQUIRED),
    department: z.string().min(1, AUTH_MESSAGES.SIGNUP.DEPARTMENT_REQUIRED),
    specialization: z.string().min(1, AUTH_MESSAGES.SIGNUP.SPECIALIZATION_REQUIRED),
    about: z.string().min(1, AUTH_MESSAGES.SIGNUP.ABOUT_REQUIRED),
    hospital_id: z.string().optional(),
  })
});

export const hospitalSignupSchema = z.object({
  body: z.object({
    hospitalName: z.string().min(1, AUTH_MESSAGES.SIGNUP.HOSPITAL_NAME_REQUIRED),
    email: z.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
    phone: z.string().min(10, AUTH_MESSAGES.SIGNUP.HOSPITAL_PHONE_MIN),
    address: z.string().min(1, AUTH_MESSAGES.SIGNUP.ADDRESS_REQUIRED),
    about: z.string().min(1, AUTH_MESSAGES.SIGNUP.ABOUT_REQUIRED),
    pincode: z.string().min(6, AUTH_MESSAGES.SIGNUP.PINCODE_MIN),
    since: z.string().min(4, AUTH_MESSAGES.SIGNUP.YEAR_REQUIRED),
    password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(AUTH_MESSAGES.FORGOT_PASSWORD.INVALID_EMAIL),
    role: z.string().optional(),
    purpose: z.string().optional()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL).optional(),
    password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
  })
});
