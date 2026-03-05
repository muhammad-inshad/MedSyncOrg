import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload,
    Save,
    User,
    FileText,
    Award,
    Info,
    CreditCard,
    ChevronLeft,
    Lock
} from 'lucide-react';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from "react-hot-toast";
import type { RootState } from '@/store/store';
import { COMMON_ROUTES } from '@/constants/frontend/common/common.routes';
import type { DoctorProfile, BaseUser } from '@/store/auth/auth.type';
import ConfirmationModal from '@/components/ConfirmationModal';

// --- UPDATED SCHEMA (6 CHAR MINIMUM) ---
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
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    // UPDATED: Now checking for 6 characters instead of 8
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

    const departments = ["General Medicine", "Cardiology", "Neurology", "Pediatrics", "Obstetrics & Gynecology", "Orthopedics", "General Surgery", "ENT", "Dermatology", "Psychiatry", "Radiology", "Anesthesiology", "Ophthalmology", "Gastroenterology", "Urology", "Nephrology", "Oncology", "Pulmonology", "Endocrinology", "Emergency Medicine"];
    const qualifications = ["MBBS", "MBBS, MD", "MBBS, MS", "MD Medicine", "MD Pediatrics", "MD Dermatology", "MD Radiology", "MS General Surgery", "MS Orthopedics", "MS Obstetrics & Gynecology", "DNB", "DM Cardiology", "DM Neurology", "MCh Neurosurgery", "Diploma"];
    const specializations = ["General Physician", "Cardiologist", "Neurologist", "Pediatrician", "Gynecologist", "Orthopedic Surgeon", "General Surgeon", "ENT Specialist", "Dermatologist", "Psychiatrist", "Radiologist", "Anesthesiologist", "Ophthalmologist", "Gastroenterologist", "Urologist", "Nephrologist", "Oncologist", "Pulmonologist", "Endocrinologist", "Emergency Physician"];

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<DoctorUpdateFormData>({
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

            // Append password only if newPassword exists
            if (pendingData.newPassword && pendingData.currentPassword) {
                formData.append('currentPassword', pendingData.currentPassword);
                formData.append('newPassword', pendingData.newPassword);
            }

            formData.append('consultationTime', JSON.stringify(pendingData.consultationTime));
            formData.append('payment', JSON.stringify(pendingData.payment));

            if (profileImageFile) formData.append('profileImage', profileImageFile);
            if (licenseImageFile) formData.append('license', licenseImageFile);

            await doctorApi.editProfile(userData._id, formData);

            toast.success("Profile updated successfully!");
            navigate(COMMON_ROUTES.REVIEWPENDING, { replace: true });
        } catch (error: unknown) {
            console.error('ERROR:', error);
    
    let errorMessage = 'Update failed';

    // Type Guard: Check if the error is specifically an Axios error
    if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    toast.error(errorMessage);
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
            reader.onloadend = () => setProfilePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLicenseImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setLicensePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Back Button */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Your Profile</h1>
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-500" />
                            Update your professional details and security settings
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
                        <button type="submit" form="doctor-edit-form" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2 hover:bg-black shadow-lg disabled:opacity-50">
                            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                        </button>
                    </div>
                </div>

                <form id="doctor-edit-form" onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* PHOTO UPLOADS */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                                <h3 className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Profile Photo</h3>
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all">
                                        {profilePreview ? <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-50 flex items-center justify-center"><User className="w-12 h-12 text-slate-300" /></div>}
                                    </div>
                                    <label className="absolute -bottom-3 -right-3 bg-blue-600 p-3 rounded-2xl text-white shadow-xl cursor-pointer hover:scale-110 transition-all">
                                        <Upload className="w-5 h-5" /><input type="file" className="hidden" accept="image/*" onChange={handleProfileImageChange} />
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Medical License</h3>
                                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                                    {licensePreview ? <img src={licensePreview} alt="License" className="w-full h-full object-cover" /> : <FileText className="w-10 h-10 text-slate-300" />}
                                    <label className="absolute inset-0 bg-slate-900/60 opacity-0 hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                                        <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> Update Document</div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLicenseImageChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* FORM CONTENT */}
                        <div className="lg:col-span-8 space-y-8">
                            
                            {/* Personal Information */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><User className="w-5 h-5" /></div><h2 className="text-xl font-bold text-slate-900">Personal Information</h2></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Full Name</label><input {...register('name')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" />{errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name.message}</p>}</div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Email</label><input {...register('email')} readOnly className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-2xl text-slate-500 cursor-not-allowed text-sm" /></div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Phone</label><input {...register('phone')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" />{errors.phone && <p className="text-[10px] text-rose-500 font-bold">{errors.phone.message}</p>}</div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Department</label><select {...register('department')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm">{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                                </div>
                                <div className="mt-6 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Address</label><textarea {...register('address')} rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl resize-none text-sm" /></div>
                            </div>

                            {/* --- PASSWORD SECURITY (6 CHAR MIN) --- */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Lock className="w-5 h-5" /></div>
                                    <h2 className="text-xl font-bold text-slate-900">Security & Password</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Current Password</label>
                                        <input type="password" {...register('currentPassword')} placeholder="Required for change" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-rose-500 outline-none text-sm font-medium" />
                                        {errors.currentPassword && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.currentPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">New Password</label>
                                        <input type="password" {...register('newPassword')} placeholder="Min 6 characters" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-sm font-medium" />
                                        {errors.newPassword && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Confirm New Password</label>
                                        <input type="password" {...register('confirmPassword')} placeholder="Repeat new password" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none text-sm font-medium" />
                                        {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-bold px-1">{errors.confirmPassword.message}</p>}
                                    </div>
                                </div>
                                <p className="mt-4 text-[11px] text-slate-400 px-1 italic">Leave fields blank to keep your current password.</p>
                            </div>

                            {/* Expertise & Schedule */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Award className="w-5 h-5" /></div><h2 className="text-xl font-bold text-slate-900">Expertise & Schedule</h2></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Specialization</label><select {...register('specialization')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm">{specializations.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Qualification</label><select {...register('qualification')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm">{qualifications.map(q => <option key={q} value={q}>{q}</option>)}</select></div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Experience (Years)</label><input {...register('experience')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">From</label><input type="time" {...register('consultationTime.start')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" /></div>
                                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">To</label><input type="time" {...register('consultationTime.end')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" /></div>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Bio</label><textarea {...register('about')} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl resize-none text-sm" /></div>
                            </div>

                            {/* Payment Config */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-3 mb-8"><div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><CreditCard className="w-5 h-5" /></div><h2 className="text-xl font-bold text-slate-900">Payment & Limits</h2></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Payment Model</label><select {...register('payment.type')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold"><option value="commission">Commission Based</option><option value="fixed">Fixed Salary</option></select></div>
                                    {paymentType === 'commission' ? (
                                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Commission %</label><input type="number" {...register('payment.commissionPercentage')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" /></div>
                                    ) : (
                                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Fixed Salary (₹)</label><input type="number" {...register('payment.fixedSalary')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" /></div>
                                    )}
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Patients / Day</label><input type="number" {...register('payment.patientsPerDayLimit')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm" /></div>
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
                title="Confirm Updates"
                message={<p>Are you sure you want to save these changes to your profile?</p>}
                confirmText="Yes, Save Changes"
                type="info"
            />
        </div>
    );
};

export default DoctorEditProfile;