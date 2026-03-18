import React, { useState } from 'react';
import { z } from 'zod';
import { Upload, X, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import SuperAdminSidebar from '../SuperAdminsidebar';

interface PatientFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  fatherName: string;
  gender: 'male' | 'female' | 'other' | '';
  dateOfBirth: string;
  address: string;
  bloodGroup: string;
  image: File | null;
  isActive: boolean;
}

const SuperAddpatient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
    image: null,
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const validateForm = (): boolean => {
    const patientSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      fatherName: z.string().optional(),
      gender: z.string().optional(),
      dateOfBirth: z.string().optional(),
      address: z.string().optional(),
      bloodGroup: z.string().optional(),
      isActive: z.boolean(),
    });

    const validation = patientSchema.safeParse(formData);

    if (!validation.success) {
      const newErrors: Partial<Record<keyof PatientFormData, string>> = {};
      validation.error.issues.forEach((issue) => {
        newErrors[issue.path[0] as keyof PatientFormData] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          submitData.append(key, value);
        } else if (value !== null && value !== '') {
          submitData.append(key, value.toString());
        }
      });
      const response = await superAdminApi.addPatient(submitData);
      console.log(response.data);
      toast.success('Patient added successfully!');
      navigate(SUPERADMIN_ROUTES.PATIENT);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while adding the patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ✅ Sidebar as top-level flex sibling */}
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header — consistent with HospitalManagement theme */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
              <p className="text-gray-600 mt-1">Fill in the patient information below</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-8 py-6">
          <div className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Basic Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-5">
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter full name', required: true },
                      { id: 'email', label: 'Email', type: 'email', placeholder: 'patient@example.com', required: true },
                      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '1234567890', required: true, maxLength: 10 },
                      { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter password', required: true },
                    ].map(({ id, label, type, placeholder, required, maxLength }) => (
                      <div key={id}>
                        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                          {label} {required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          type={type}
                          id={id}
                          name={id}
                          value={formData[id as keyof PatientFormData] as string}
                          onChange={handleInputChange}
                          placeholder={placeholder}
                          maxLength={maxLength}
                          className={`w-full px-4 py-2.5 border rounded-lg outline-none transition-all text-sm ${
                            errors[id as keyof PatientFormData]
                              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200'
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                          }`}
                        />
                        {errors[id as keyof PatientFormData] && (
                          <p className="mt-1 text-xs text-red-500 font-medium">
                            {errors[id as keyof PatientFormData]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Details */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-5">
                    Personal Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        id="fatherName"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        placeholder="Enter father's name"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-sm"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Group
                      </label>
                      <select
                        id="bloodGroup"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white text-sm"
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(group => (
                          <option key={group} value={group}>{group}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Enter complete address"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Picture */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-5">
                    Profile Picture
                  </h2>
                  <div className="flex items-start gap-6">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor="image"
                        className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition text-sm font-medium border border-blue-200"
                      >
                        {imagePreview ? 'Change Image' : 'Choose Image'}
                      </label>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      {errors.image && (
                        <p className="mt-1 text-xs text-red-500 font-medium">{errors.image}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Active Status</p>
                    <p className="text-xs text-blue-700">
                      Control if this patient appears in active records
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded-md focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Adding Patient...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Add Patient
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAddpatient;