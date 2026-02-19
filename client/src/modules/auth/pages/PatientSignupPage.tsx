import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../../../assets/images/logo.png'
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from '@/lib/api';
import axios from 'axios';


const SignUpSchema = z
    .object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
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
            await api.post("/api/auth/send-otp", {
                email: data.email,
                purpose: "signup"
            });

            toast.success("OTP sent to your email");

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
            let errorMessage = 'An unexpected error occurred';

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
                    Sign Up
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Username */}
                    <div>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="Username"
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
                            placeholder="Email"
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
                            placeholder="Phone Number"
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
                            placeholder="Password"
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
                            placeholder="Confirm Password"
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
                        {isLoading ? 'Signing Up...' : 'Sign Up'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-gray-600">
                    Already have an account?{' '}
                    <a href="/" className="text-blue-600 font-medium">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
