import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../../../../lib/api';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';
import type { IPatient } from '../../../../interfaces/IPatient';

type PatientFormData = {
  name: string;
  email: string;
  phone: string;
  fatherName: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  bloodGroup: string;
  image: string | null;
  isActive: boolean;
};

const PatientEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient as IPatient | undefined;

  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    bloodGroup: '',
    image: null,
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [willRemoveImage, setWillRemoveImage] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (!patient) {
      toast.error('No patient data found');
      navigate(ADMIN_ROUTES.ADMINPATIENT);
      return;
    }

    setFormData({
      name: patient.name || '',
      email: patient.email || '',
      phone: patient.phone?.toString() || '',
      fatherName: patient.fatherName || '',
      gender: patient.gender || '',
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
        : '',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || '',
      image: null, // We keep this null unless the user selects a NEW image
      isActive: patient.isActive ?? true,
    });

    if (patient.image) {
      setImagePreview(patient.image);
    }
  }, [patient, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof PatientFormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Improvement: Add File Size Validation (e.g., 2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData((prev) => ({ ...prev, image: base64String }));
      setWillRemoveImage(false); // If they pick a new one, we aren't removing anymore
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    setWillRemoveImage(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PatientFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {

      const payload = {
        ...formData,
        willRemoveImage,
      };

      const response = await api.patch(`/api/patient/patientEdit/${patient?._id}`, payload);

      if (response.status === 200) {
        toast.success('Patient updated successfully!');
        navigate(ADMIN_ROUTES.ADMINPATIENT, { replace: true });
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update patient';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Edit Patient Profile</h1>
            <p className="text-gray-500 text-sm">Update the records for {patient.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center sm:flex-row gap-6 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Profile Photo</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image')?.click()}
                  className="text-sm bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-gray-400 mt-2">Max size 2MB. Format: JPG, PNG</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <h2 className="col-span-full text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.name ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={10}
                  className={`w-full px-4 py-2 rounded-lg border outline-none transition-all ${errors.phone ? 'border-red-500 ring-1 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Medical / Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <h2 className="col-span-full text-lg font-semibold text-gray-800 border-b pb-2">Medical Details</h2>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none bg-white"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />

                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">Select</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-sm font-medium text-gray-700">Residential Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm font-semibold text-blue-900">Active Status</p>
                <p className="text-xs text-blue-700">Control if this patient appears in active records</p>
              </div>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-6 h-6 text-blue-600 border-gray-300 rounded-md focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-white text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
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

export default PatientEdit;