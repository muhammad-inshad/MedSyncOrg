import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';

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

const PatientAddPage = () => {
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
  const navigate = useNavigate()
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
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
      newErrors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      console.log(formData)
      const response = await api.post('/api/admin/patientAdd', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data)
      toast.success("Profile added successfully!");
      navigate(ADMIN_ROUTES.ADMINPATIENT);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while adding the patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
            <p className="mt-2 text-gray-600">Fill in the patient information below</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="patient@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Details</h2>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter father's name"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  <div className="relative">
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />

                  </div>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select blood group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Picture</h2>
              <div className="flex items-start gap-6">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
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
                    htmlFor="image"
                    className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                  >
                    Choose Image
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Patient</span>
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
              </button>
              <button
                type="button"
                onClick={() => window.history.back()}
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

export default PatientAddPage;