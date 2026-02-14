import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X } from 'lucide-react';

import api from '../../../../lib/api';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';

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
})

type AdminAddDoctorpageFormData = z.infer<typeof doctorRegistrationSchema>;

const AdminAddDoctorpage: React.FC = () => {
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
  } = useForm<AdminAddDoctorpageFormData>({
    resolver: zodResolver(doctorRegistrationSchema),
  });

  const onSubmit = async (data: AdminAddDoctorpageFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'confirmPassword' && value) {
          formData.append(key, value as string);
        }
      });

      if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
      }
      if (licenseImageFile) {
        formData.append('license', licenseImageFile);
      }

      const response = await api.post('/api/doctor/RegistorDoctor', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('SUCCESS:', response.data);
      toast.success("Profile added successfully!");
      navigate(ADMIN_ROUTES.ADMINDOCTORMANGEMENT);
      reset();
      setProfileImageFile(null);
      setLicenseImageFile(null);
      setProfilePreview('');
      setLicensePreview('');
    } catch (error: unknown) {
      console.error('ERROR:', error);
      let errorMessage = 'An unexpected error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
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

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfilePreview('');
  };

  const removeLicenseImage = () => {
    setLicenseImageFile(null);
    setLicensePreview('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Doctor</h1>
            <p className="mt-2 text-gray-600">Fill in the doctor information below</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    placeholder="Enter doctor name"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    placeholder="doctor@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    placeholder="1234567890"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('department')}
                    type="text"
                    id="department"
                    placeholder="Enter department"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('address')}
                    id="address"
                    placeholder="Enter complete address"
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('qualification')}
                    type="text"
                    id="qualification"
                    placeholder="Enter qualification"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.qualification ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.qualification && <p className="mt-1 text-sm text-red-500">{errors.qualification.message}</p>}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('experience')}
                    type="text"
                    id="experience"
                    placeholder="Enter years of experience"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.experience ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('specialization')}
                    type="text"
                    id="specialization"
                    placeholder="Enter specialization"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.specialization ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.specialization && <p className="mt-1 text-sm text-red-500">{errors.specialization.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="about" className="block text-sm font-medium text-gray-700 mb-2">
                    About the Doctor <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('about')}
                    id="about"
                    placeholder="Enter information about the doctor"
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none ${errors.about ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.about && <p className="mt-1 text-sm text-red-500">{errors.about.message}</p>}
                </div>
              </div>
            </div>

            {/* Documents Upload */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-start gap-4">
                    {profilePreview ? (
                      <div className="relative">
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor="profileImage"
                        className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                      >
                        {profileImageFile ? 'Change Image' : 'Choose Image'}
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Medical License */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical License
                  </label>
                  <div className="flex items-start gap-4">
                    {licensePreview ? (
                      <div className="relative">
                        <img
                          src={licensePreview}
                          alt="License Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeLicenseImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor="licenseImage"
                        className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                      >
                        {licenseImageFile ? 'Change License' : 'Choose License'}
                      </label>
                      <input
                        type="file"
                        id="licenseImage"
                        accept="image/*"
                        onChange={handleLicenseImageChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('password')}
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Doctor...' : 'Add Doctor'}
              </button>
              <button
                type="button"
                onClick={() => navigate(ADMIN_ROUTES.ADMINDOCTORMANGEMENT)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddDoctorpage;