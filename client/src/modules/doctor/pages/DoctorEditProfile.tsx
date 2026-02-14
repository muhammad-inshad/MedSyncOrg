import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload,
    Save,
    User,
    FileText,
    MapPin,
    Briefcase,
    Phone,
    Mail,
    Award,
    Info,
    Clock,
    CreditCard,
    ChevronLeft
} from 'lucide-react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from "react-hot-toast";
import type { RootState } from '@/store/store';
import { COMMON_ROUTES } from '@/constants/frontend/common/common.routes';
import type { DoctorProfile, BaseUser } from '@/store/auth/auth.type';
import ConfirmationModal from '@/components/ConfirmationModal';

const doctorUpdateSchema = z.object({
    name: z.string().min(1, 'Doctor name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(1, 'Address is required'),
    qualification: z.string().min(1, 'Qualification is required'),
    experience: z.string().min(1, 'Experience is required'),
    department: z.string().min(1, 'Department is required'),
    specialization: z.string().min(1, 'Specialization is required'),
    about: z.string().min(1, 'About is required'),
    consultationTime: z.object({
        start: z.string().min(1, 'Start time is required'),
        end: z.string().min(1, 'End time is required'),
    }),
    payment: z.object({
        type: z.enum(['commission', 'fixed']),
        commissionPercentage: z.string().optional(),
        fixedSalary: z.string().optional(),
        payoutCycle: z.enum(['weekly', 'monthly']),
        patientsPerDayLimit: z.string().min(1, 'Limit is required'),
    }),
});

type DoctorUpdateFormData = z.infer<typeof doctorUpdateSchema>;

const DoctorEditProfile: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const userData = (user as (BaseUser & { _doc?: DoctorProfile }))?._doc ?? (user as DoctorProfile);

    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [licenseImageFile, setLicenseImageFile] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string>('');
    const [licensePreview, setLicensePreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState<DoctorUpdateFormData | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<DoctorUpdateFormData>({
        resolver: zodResolver(doctorUpdateSchema),
    });

    const paymentType = watch('payment.type');

    useEffect(() => {
        if (userData) {
            reset({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone?.toString() || '',
                address: userData.address || '',
                qualification: userData.qualification || '',
                experience: userData.experience?.toString() || '',
                department: userData.department || '',
                specialization: userData.specialization || '',
                about: userData.about || '',
                consultationTime: {
                    start: userData.consultationTime?.start || '',
                    end: userData.consultationTime?.end || '',
                },
                payment: {
                    type: userData.payment?.type || 'commission',
                    commissionPercentage: userData.payment?.commissionPercentage?.toString() || '',
                    fixedSalary: userData.payment?.fixedSalary?.toString() || '',
                    payoutCycle: userData.payment?.payoutCycle || 'monthly',
                    patientsPerDayLimit: userData.payment?.patientsPerDayLimit?.toString() || '20',
                },
            });
            if (userData.profileImage) setProfilePreview(userData.profileImage);
            if (userData.licence) setLicensePreview(userData.licence);
        }
    }, [userData, reset]);

    const onFormSubmit = (data: DoctorUpdateFormData) => {
        setPendingData(data);
        setIsConfirmOpen(true);
    };

    const executeUpdate = async () => {
        if (!pendingData) return;

        try {
            setIsSubmitting(true);
            const formData = new FormData();

            const flatFields = ['name', 'email', 'phone', 'address', 'qualification', 'experience', 'department', 'specialization', 'about'];
            flatFields.forEach(key => {
                formData.append(key, String(pendingData[key as keyof DoctorUpdateFormData]));
            });

            formData.append('consultationTime', JSON.stringify(pendingData.consultationTime));
            formData.append('payment', JSON.stringify(pendingData.payment));

            if (profileImageFile) {
                formData.append('profileImage', profileImageFile);
            }
            if (licenseImageFile) {
                formData.append('license', licenseImageFile);
            }

            await api.patch(`/api/doctor/doctorEdit/${userData._id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success("Profile updated successfully!");
            navigate(COMMON_ROUTES.REVIEWPENDING, { replace: true });
        } catch (error: unknown) {
            console.error('ERROR:', error);
            let errorMessage = 'An unexpected error occurred';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }
            toast.error(`Update failed: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
            setIsConfirmOpen(false);
        }
    };

    const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLicenseImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLicensePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
      

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Navigation Breadcrumb */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Your Profile</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            Update your professional details and settings
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="doctor-edit-form"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <form id="doctor-edit-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar: Photos */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Profile Photo Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                                <h3 className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Profile Photo</h3>
                                <div className="relative group/photo">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden ring-4 ring-slate-50 group-hover/photo:ring-blue-50 transition-all duration-300">
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                                <User className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-3 -right-3 bg-blue-600 p-3 rounded-2xl text-white shadow-xl cursor-pointer hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all">
                                        <Upload className="w-5 h-5" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                                    </label>
                                </div>
                                <p className="mt-8 text-[11px] text-slate-400 text-center leading-relaxed">
                                    Allowed formats: JPG, PNG, WEBP. <br />Max size: 5MB
                                </p>
                            </div>

                            {/* Medical License Card */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Medical License</h3>
                                <div className="relative group/license aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                                    {licensePreview ? (
                                        <img src={licensePreview} alt="License" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-10 h-10 text-slate-300" />
                                    )}
                                    <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/license:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                        <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5" /> Update Document
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLicenseImageChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Main Form Sections */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Profile Information */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                {...register('name')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 text-sm font-medium"
                                            />
                                        </div>
                                        {errors.name && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.name.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                {...register('email')}
                                                readOnly
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-500 outline-none transition-all text-sm font-medium cursor-not-allowed"
                                            />
                                        </div>
                                        {errors.email && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.email.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                {...register('phone')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.phone.message}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Department</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                {...register('department')}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                                        <textarea
                                            {...register('address')}
                                            rows={2}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Professional details */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Expertise & Schedule</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Specialization</label>
                                        <input
                                            {...register('specialization')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Qualification</label>
                                        <input
                                            {...register('qualification')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Experience (Years)</label>
                                        <input
                                            {...register('experience')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>

                                    {/* Consultation Time Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Availability From</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="time"
                                                    {...register('consultationTime.start')}
                                                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">To</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="time"
                                                    {...register('consultationTime.end')}
                                                    className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xs font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Bio / Professional Brief</label>
                                    <textarea
                                        {...register('about')}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Payment Configuration */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">Payment & limits</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Payment Model</label>
                                        <select
                                            {...register('payment.type')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                                        >
                                            <option value="commission">Commission Based</option>
                                            <option value="fixed">Fixed Salary</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Payout Cycle</label>
                                        <select
                                            {...register('payment.payoutCycle')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="weekly">Weekly</option>
                                        </select>
                                    </div>

                                    {paymentType === 'commission' ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Commission %</label>
                                            <input
                                                type="number"
                                                {...register('payment.commissionPercentage')}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 15"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Fixed Salary (₹)</label>
                                            <input
                                                type="number"
                                                {...register('payment.fixedSalary')}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                                placeholder="e.g. 80000"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Patients / Day Limit</label>
                                        <input
                                            type="number"
                                            {...register('payment.patientsPerDayLimit')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={executeUpdate}
                title="Confirm Profile Updates"
                message={
                    <div className="space-y-3">
                        <p>Are you sure you want to save these changes to your profile?</p>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                Changes will take effect immediately. If you are currently active, your profile visibility will reflect these updates instantly.
                            </p>
                        </div>
                    </div>
                }
                confirmText="Yes, Save Changes"
                type="info"
            />
           
        </div>
    );
};

export default DoctorEditProfile;
