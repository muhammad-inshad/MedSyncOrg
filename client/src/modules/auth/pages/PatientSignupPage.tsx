import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../../assets/images/logo.png'
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from '../../../constants/backend/auth/auth.api';
import axios from 'axios';
import { AUTH_MESSAGES } from '@/constants/frontend/auth/auth.messages';


const SignUpSchema = z
    .object({
        name: z.string().min(3, AUTH_MESSAGES.SIGNUP.NAME_MIN_LENGTH),
        email: z.string().email(AUTH_MESSAGES.SIGNUP.INVALID_EMAIL),
        phone: z.string().regex(/^[0-9]{10}$/, AUTH_MESSAGES.SIGNUP.PHONE_TEN_DIGITS),
        password: z.string().min(6, AUTH_MESSAGES.COMMON.PASSWORD_LENGTH),
        confirmPassword: z.string().min(6, AUTH_MESSAGES.SIGNUP.CONFIRM_PASSWORD_REQUIRED),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: AUTH_MESSAGES.COMMON.PASSWORDS_NOT_MATCH,
        path: ["confirmPassword"],
    });


type SignUpFormData = z.infer<typeof SignUpSchema>;

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormData>({
        resolver: zodResolver(SignUpSchema),

    });


    const navigate = useNavigate();

    const onSubmit = async (data: SignUpFormData) => {
        setIsLoading(true);
        console.log(data)
        try {
            localStorage.setItem('otpPageAllowed', 'true');
            await authApi.sendOtp({
                email: data.email,
                role: "patient",
                purpose: "signup"
            });

            toast.success(AUTH_MESSAGES.COMMON.OTP_SENT);

            const expirationTime = Date.now() + 60 * 1000; // 60 seconds from now
            localStorage.setItem('otpExpirationTime', expirationTime.toString());

            navigate("/otp?role=patient", {
                replace: true,
                state: {
                    signupData: data,
                    from: 'signup'
                },
            });

        } catch (error: unknown) {
            let errorMessage = AUTH_MESSAGES.COMMON.UNEXPECTED_ERROR;

            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="mb-8">
                <img src={logo} alt="MedSync" className="w-44" />
            </div>

            {/* Sign Up Form */}
            <div className="w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
                    {AUTH_MESSAGES.SIGNUP.PATIENT_TITLE}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username */}
                    <div>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder={AUTH_MESSAGES.SIGNUP.USERNAME_PLACEHOLDER}
                            className={`w-full px-4 py-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder={AUTH_MESSAGES.SIGNUP.EMAIL_PLACEHOLDER}
                            className={`w-full px-4 py-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <input
                            {...register('phone')}
                            type="tel"
                            placeholder={AUTH_MESSAGES.SIGNUP.PHONE_PLACEHOLDER}
                            className={`w-full px-4 py-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {errors.phone && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.phone.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder={AUTH_MESSAGES.SIGNUP.PASSWORD_PLACEHOLDER}
                            className={`w-full px-4 py-3 border rounded-lg pr-12 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeOff /> : <Eye />}
                        </button>
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <input
                            {...register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder={AUTH_MESSAGES.SIGNUP.CONFIRM_PASSWORD_PLACEHOLDER}
                            className={`w-full px-4 py-3 border rounded-lg pr-12 ${errors.confirmPassword
                                ? 'border-red-500'
                                : 'border-gray-300'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                        {errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? AUTH_MESSAGES.COMMON.SIGNING_UP : AUTH_MESSAGES.COMMON.SIGNUP}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-gray-600">
                    {AUTH_MESSAGES.SIGNUP.ALREADY_HAVE_ACCOUNT}{' '}
                    <a href="/" className="text-blue-600 font-medium">
                        {AUTH_MESSAGES.SIGNUP.LOGIN_LINK}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
