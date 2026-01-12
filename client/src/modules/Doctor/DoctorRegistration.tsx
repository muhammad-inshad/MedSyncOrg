import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Footer from '../patient/components/Footer';
import Navbar from '../patient/components/Navbar';
import api from '../../lib/api';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';


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
  patientsPerDay: z.string().min(1, 'Patients per day is required'),
  
 timeStartHour: z.string().min(1, 'Start hour is required'),
  timeStartMinute: z.string().min(1, 'Start minute is required'),
  timeStartPeriod: z.enum(['AM', 'PM']),

  timeEndHour: z.string().min(1, 'End hour is required'),
  timeEndMinute: z.string().min(1, 'End minute is required'),
  timeEndPeriod: z.enum(['AM', 'PM']),

  salaryType: z.enum(['commission', 'fixed']),
  percentageOrSalary: z.string().min(1, 'Percentage/Salary is required'),
  payoutCycle: z.enum(['monthly', 'weekly']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {

  const startHour = parseInt(data.timeStartHour);
  const endHour = parseInt(data.timeEndHour);
  const startPeriod = data.timeStartPeriod;
  const endPeriod = data.timeEndPeriod;
  
  if (startPeriod === endPeriod) {
    return endHour > startHour || 
           (endHour === startHour && parseInt(data.timeEndMinute) > parseInt(data.timeStartMinute));
  }
  return endPeriod === 'PM' && startPeriod === 'AM';
}, {
  message: "End time must be after start time",
  path: ["timeEndHour"],
});

type DoctorRegistrationFormData = z.infer<typeof doctorRegistrationSchema>;

const DoctorRegistrationForm: React.FC = () => {
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [licenseImageFile, setLicenseImageFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [licensePreview, setLicensePreview] = useState<string>('');
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<DoctorRegistrationFormData>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      salaryType: 'commission',
      payoutCycle: 'monthly',
      timeStartMinute: '00',
      timeEndMinute: '00',
    },
  });

  const salaryType = watch('salaryType');

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
      const response = await api.post('/doctor/RegistorDoctor', formData, {
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
    } catch (error: any) {
      console.error('ERROR:', error);
      toast.error('Registration failed: ' + (error.response?.data?.message || error.message));
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

  const handleNewsletterSubmit = () => {
    if (newsletterEmail) {
      console.log('Newsletter email:', newsletterEmail);
      alert(`Subscribed: ${newsletterEmail}`);
      setNewsletterEmail('');
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('phone')}
              type="tel"
              placeholder="Phone"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
          </div>

          <div>
            <textarea
              {...register('address')}
              placeholder="Address"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
          </div>

          {/* Qualification, Experience, Department */}
          {['qualification', 'experience', 'department'].map((field) => (
            <div key={field}>
              <input
                {...register(field as keyof DoctorRegistrationFormData)}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field as keyof DoctorRegistrationFormData] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors[field as keyof DoctorRegistrationFormData] && (
                <p className="mt-1 text-sm text-red-500">
                  {(errors[field as keyof DoctorRegistrationFormData] as any)?.message}
                </p>
              )}
            </div>
          ))}

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

          <div>
            <input
              {...register('specialization')}
              type="text"
              placeholder="Specialization"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.specialization ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.specialization && <p className="mt-1 text-sm text-red-500">{errors.specialization.message}</p>}
          </div>

          <div>
            <textarea
              {...register('about')}
              placeholder="About the Doctor"
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.about ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.about && <p className="mt-1 text-sm text-red-500">{errors.about.message}</p>}
          </div>

          {/* ✅ NEW: AM/PM Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <div className="flex gap-2">
                <select
                  {...register('timeStartHour')}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeStartHour ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  {...register('timeStartMinute')}
                  className={`w-20 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeStartMinute ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">MM</option>
                  {[0, 15, 30, 45].map(min => (
                    <option key={min} value={String(min).padStart(2, '0')}>
                      {String(min).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  {...register('timeStartPeriod')}
                  className={`w-20 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeStartPeriod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {(errors.timeStartHour || errors.timeStartMinute || errors.timeStartPeriod) && (
                <p className="mt-1 text-xs text-red-500">Complete start time</p>
              )}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <div className="flex gap-2">
                <select
                  {...register('timeEndHour')}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeEndHour ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">HH</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  {...register('timeEndMinute')}
                  className={`w-20 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeEndMinute ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">MM</option>
                  {[0, 15, 30, 45].map(min => (
                    <option key={min} value={String(min).padStart(2, '0')}>
                      {String(min).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  {...register('timeEndPeriod')}
                  className={`w-20 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.timeEndPeriod ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">AM/PM</option>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              {(errors.timeEndHour || errors.timeEndMinute || errors.timeEndPeriod) && (
                <p className="mt-1 text-xs text-red-500">Complete end time</p>
              )}
            </div>
          </div>

          <div>
            <input
              {...register('patientsPerDay')}
              type="text"
              placeholder="Patients/Day"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientsPerDay ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.patientsPerDay && <p className="mt-1 text-xs text-red-500">{errors.patientsPerDay.message}</p>}
          </div>

          {/* Salary Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
            <div className="flex gap-8">
              <label className="flex items-center gap-2">
                <input type="radio" {...register('salaryType')} value="commission" className="text-blue-600" />
                <span>Commission</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" {...register('salaryType')} value="fixed" className="text-blue-600" />
                <span>Fixed</span>
              </label>
            </div>
            {errors.salaryType && <p className="mt-1 text-sm text-red-500">{errors.salaryType.message}</p>}
          </div>

          <div>
            <input
              {...register('percentageOrSalary')}
              type="text"
              placeholder={salaryType === 'commission' ? 'Commission Percentage (e.g., 20)' : 'Fixed Salary Amount'}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.percentageOrSalary ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.percentageOrSalary && <p className="mt-1 text-sm text-red-500">{errors.percentageOrSalary.message}</p>}
            <p className="mt-1 text-xs text-gray-500">
              {salaryType === 'commission'
                ? 'Enter percentage without % sign (e.g., 15 for 15%)'
                : 'Enter monthly salary amount'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payout Cycle</label>
            <div className="flex gap-8">
              <label className="flex items-center gap-2">
                <input type="radio" {...register('payoutCycle')} value="monthly" className="text-blue-600" />
                <span>Monthly</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" {...register('payoutCycle')} value="weekly" className="text-blue-600" />
                <span>Weekly</span>
              </label>
            </div>
            {errors.payoutCycle && <p className="mt-1 text-sm text-red-500">{errors.payoutCycle.message}</p>}
          </div>

          {/* Password Fields */}
          <div>
            <input
              {...register('password')}
              type="password"
              placeholder="Password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="Confirm Password"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-center pt-8">
            <button
              type="submit"
              className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ?'please wait...':'Submit'}
            </button>
          </div>
        </form>
      </div>
      <Footer/>
    </div>
  );
};

export default DoctorRegistrationForm;
