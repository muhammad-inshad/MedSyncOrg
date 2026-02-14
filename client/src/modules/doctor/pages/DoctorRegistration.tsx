import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Footer from '../../patient/components/Footer';
import Navbar from '../../patient/components/Navbar';
import api from '../../../lib/api';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
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
})

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
      navigate("/login/doctor");
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
    }
    finally {
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


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name, Email, Phone, Address */}
          <div>
            <input
              {...register('name')}
              type="text"
              placeholder="Doctor Name"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="Phone"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <textarea
              {...register('address')}
              placeholder="Address"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
          </div>

          {/* Qualification Dropdown */}
          <div>
            <select
              {...register('qualification')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.qualification ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Qualification</option>
              <option value="MBBS">MBBS</option>
              <option value="MD">MD</option>
              <option value="MS">MS</option>
              <option value="BDS">BDS</option>
              <option value="MDS">MDS</option>
              <option value="BAMS">BAMS</option>
              <option value="BHMS">BHMS</option>
              <option value="DM">DM</option>
              <option value="MCh">MCh</option>
              <option value="DNB">DNB</option>
              <option value="FRCS">FRCS</option>
              <option value="PhD (Medical)">PhD (Medical)</option>
              <option value="Diploma">Diploma</option>
            </select>
            {errors.qualification && <p className="mt-1 text-sm text-red-500">{errors.qualification.message}</p>}
          </div>

          {/* Experience Text Input */}
          <div>
            <input
              {...register('experience')}
              type="text"
              placeholder="Experience (e.g. 5 years)"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.experience && <p className="mt-1 text-sm text-red-500">{errors.experience.message}</p>}
          </div>

          {/* Department Dropdown */}
          <div>
            <select
              {...register('department')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Department</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="ENT">ENT</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Urology">Urology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Oncology">Oncology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Nephrology">Nephrology</option>
              <option value="Rheumatology">Rheumatology</option>
              <option value="Emergency">Emergency</option>
              <option value="Radiology">Radiology</option>
              <option value="Pathology">Pathology</option>
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>}
          </div>

          {/*  NEW: Profile Image + License Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
                <span className="text-gray-500">
                  {profileImageFile ? 'Change Profile Image' : 'Upload Profile Image'}
                </span>
              </label>
              {profilePreview && (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg shadow"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medical License</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLicenseImageChange}
                  className="hidden"
                />
                <span className="text-gray-500">
                  {licenseImageFile ? 'Change License' : 'Upload License'}
                </span>
              </label>
              {licensePreview && (
                <img
                  src={licensePreview}
                  alt="License Preview"
                  className="mt-4 w-full h-48 object-cover rounded-lg shadow"
                />
              )}
            </div>
          </div>

          {/* Specialization Dropdown */}
          <div>
            <select
              {...register('specialization')}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.specialization ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Specialization</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="ENT Specialist">ENT Specialist</option>
              <option value="Ophthalmologist">Ophthalmologist</option>
              <option value="Urologist">Urologist</option>
              <option value="Gastroenterologist">Gastroenterologist</option>
              <option value="Pulmonologist">Pulmonologist</option>
              <option value="Oncologist">Oncologist</option>
              <option value="Endocrinologist">Endocrinologist</option>
              <option value="Nephrologist">Nephrologist</option>
              <option value="Rheumatologist">Rheumatologist</option>
              <option value="Anesthesiologist">Anesthesiologist</option>
              <option value="Radiologist">Radiologist</option>
              <option value="Pathologist">Pathologist</option>
            </select>
            {errors.specialization && <p className="mt-1 text-sm text-red-500">{errors.specialization.message}</p>}
          </div>

          <div>
            <textarea
              {...register('about')}
              placeholder="About the Doctor"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.about ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.about && <p className="mt-1 text-sm text-red-500">{errors.about.message}</p>}
          </div>




          {/* Password Fields */}
          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'please wait...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default DoctorRegistrationForm;
