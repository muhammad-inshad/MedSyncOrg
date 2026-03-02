import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../constants/backend/auth/auth.api';
import axios from 'axios';

const doctorRegistrationSchema = z.object({
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type DoctorRegistrationFormData = z.infer<typeof doctorRegistrationSchema>;

const DoctorRegistrationForm: React.FC = () => {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [licenseImageFile, setLicenseImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [licensePreview, setLicensePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorRegistrationFormData>({
    resolver: zodResolver(doctorRegistrationSchema),
  });

  const onSubmit = async (data: DoctorRegistrationFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'confirmPassword' && value) formData.append(key, value as string);
      });
      if (profileImageFile) formData.append('profileImage', profileImageFile);
      if (licenseImageFile) formData.append('license', licenseImageFile);

      await authApi.signup(formData);

      toast.success('Registration successful! Please login.');
      navigate(`/login/doctor`);
      reset();
      setProfileImageFile(null);
      setLicenseImageFile(null);
      setProfilePreview('');
      setLicensePreview('');
    } catch (error: unknown) {
      let msg = 'Something went wrong';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        msg = error.response.data.message;
      }
      toast.error(`Registration failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLicensePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const inputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
    }`;

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const errorClass = 'text-xs text-red-500 mt-1';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Doctor Registration</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your details to create an account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Personal Info */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input {...register('name')} className={inputClass(!!errors.name)} placeholder="Dr. John Doe" />
                {errors.name && <p className={errorClass}>{errors.name.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input {...register('phone')} type="tel" className={inputClass(!!errors.phone)} placeholder="+91 98765 43210" />
                {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input {...register('email')} type="email" className={inputClass(!!errors.email)} placeholder="doctor@example.com" />
            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Clinic / Hospital Address</label>
            <textarea {...register('address')} rows={2} className={inputClass(!!errors.address)} placeholder="123 Medical Street, Malappuram, Kerala" />
            {errors.address && <p className={errorClass}>{errors.address.message}</p>}
          </div>

          <hr className="border-gray-100" />

          {/* Professional Info */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Professional Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Qualification</label>
                <select {...register('qualification')} className={inputClass(!!errors.qualification)}>
                  <option value="">Select</option>
                  <option value="MBBS">MBBS</option>
                  <option value="MD">MD</option>
                  <option value="MS">MS</option>
                  <option value="DM">DM</option>
                  <option value="MCh">MCh</option>
                  <option value="DNB">DNB</option>
                  <option value="BDS">BDS</option>
                  <option value="MDS">MDS</option>
                </select>
                {errors.qualification && <p className={errorClass}>{errors.qualification.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input {...register('experience')} className={inputClass(!!errors.experience)} placeholder="e.g. 8" />
                {errors.experience && <p className={errorClass}>{errors.experience.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Department</label>
                <select {...register('department')} className={inputClass(!!errors.department)}>
                  <option value="">Select</option>
                  <option value="cardiology">Cardiology</option>
                  <option value="neurology">Neurology</option>
                  <option value="orthopedics">Orthopedics</option>
                  <option value="pediatrics">Pediatrics</option>
                  <option value="gynecology">Gynecology</option>
                  <option value="dermatology">Dermatology</option>
                  <option value="oncology">Oncology</option>
                  <option value="psychiatry">Psychiatry</option>
                  <option value="general">General Medicine</option>
                </select>
                {errors.department && <p className={errorClass}>{errors.department.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Specialization</label>
                <select {...register('specialization')} className={inputClass(!!errors.specialization)}>
                  <option value="">Select</option>
                  <option value="interventional-cardiology">Interventional Cardiology</option>
                  <option value="pediatric-neurology">Pediatric Neurology</option>
                  <option value="spine-surgery">Spine Surgery</option>
                  <option value="neonatology">Neonatology</option>
                  <option value="fertility">Fertility & IVF</option>
                  <option value="cosmetic-dermatology">Cosmetic Dermatology</option>
                  <option value="general">General Practice</option>
                </select>
                {errors.specialization && <p className={errorClass}>{errors.specialization.message}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>About You</label>
            <textarea
              {...register('about')}
              rows={4}
              className={inputClass(!!errors.about)}
              placeholder="Brief professional summary, expertise, achievements..."
            />
            {errors.about && <p className={errorClass}>{errors.about.message}</p>}
          </div>

          <hr className="border-gray-100" />

          {/* Documents */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Profile Photo */}
              <div>
                <label className={labelClass}>Profile Photo</label>
                <div className="flex items-center gap-3">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">Photo</div>
                  )}
                  <label className="cursor-pointer text-sm text-blue-600 hover:underline">
                    Upload
                    <input type="file" accept="image/*" onChange={handleProfileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* License */}
              <div>
                <label className={labelClass}>Medical License</label>
                <label className="cursor-pointer block border border-dashed border-gray-300 rounded-md px-3 py-4 text-center hover:bg-gray-50 transition">
                  <input type="file" accept="image/*" onChange={handleLicenseChange} className="hidden" />
                  <p className="text-sm text-gray-500">
                    {licenseImageFile ? licenseImageFile.name : 'Click to upload license'}
                  </p>
                </label>
                {licensePreview && (
                  <img src={licensePreview} alt="License" className="mt-2 h-24 object-contain border rounded" />
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Password */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Security</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password</label>
                <input {...register('password')} type="password" className={inputClass(!!errors.password)} placeholder="Min. 6 characters" />
                {errors.password && <p className={errorClass}>{errors.password.message}</p>}
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input {...register('confirmPassword')} type="password" className={inputClass(!!errors.confirmPassword)} placeholder="Re-enter password" />
                {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-md transition"
            >
              {isSubmitting ? 'Submitting...' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Already have an account?{' '}
            <a href="/login/doctor" className="text-blue-600 hover:underline">Login</a>
          </p>

        </form>
      </div>
    </div>
  );
};

export default DoctorRegistrationForm;