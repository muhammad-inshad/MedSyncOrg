import React, { useState, useEffect } from 'react';
import { Upload, Building2, Mail, Phone, MapPin, Calendar, Save, X, ArrowLeft, Trash2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { IHospital } from '@/interfaces/IHospital';

import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import { useAppSelector } from '@/hooks/redux';

interface IHospitalFormData {
  hospitalName: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  since: number;
  pincode: string;
  about: string;
  licence: string;
  isActive: boolean;
  password: string;
  confirmPassword: string;
  subscription: {
    plan: "free" | "basic" | "premium";
    amount: number;
    status: "active" | "expired" | "cancelled";
    startDate?: string | Date;
    endDate?: string | Date;
  };
  images: {
    landscape: string[];
    medicalTeam: string[];
    patientCare: string[];
    services: string[];
  };
}

interface FormErrors {
  [key: string]: string;
}

const MAX_IMAGES_PER_CATEGORY = 3;

const HospitalEdit = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [hospitalId, setHospitalId] = useState<string>('');
  const [formData, setFormData] = useState<IHospitalFormData>({
    hospitalName: '',
    logo: '',
    address: '',
    email: '',
    phone: '',
    since: new Date().getFullYear(),
    pincode: '',
    about: '',
    licence: '',
    isActive: true,
    password: '',
    confirmPassword: '',
    subscription: {
      plan: 'free',
      amount: 0,
      status: 'active',
      startDate: undefined,
      endDate: undefined
    },
    images: {
      landscape: [],
      medicalTeam: [],
      patientCare: [],
      services: []
    }
  });

  const [logoPreview, setLogoPreview] = useState<string>('');
  const [licensePreview, setLicensePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user) {
      loadHospitalData(user as IHospital);
      setHospitalId(user._id);
    }
  }, [user]);

  const loadHospitalData = (data: IHospital) => {
    setHospitalId(data._id);
    setFormData({
      hospitalName: data.hospitalName || '',
      logo: data.logo || '',
      address: data.address || '',
      email: data.email || '',
      phone: data.phone || '',
      since: data.since || new Date().getFullYear(),
      pincode: data.pincode || '',
      about: data.about || '',
      licence: data.licence || '',
      isActive: data.isActive ?? true,
      password: '',
      confirmPassword: '',
      subscription: {
        plan: data.subscription?.plan || 'free',
        amount: data.subscription?.amount || 0,
        status: data.subscription?.status || 'active',
        startDate: data.subscription?.startDate,
        endDate: data.subscription?.endDate
      },
      images: data.images || {
        landscape: [],
        medicalTeam: [],
        patientCare: [],
        services: []
      }
    });

    if (data.logo) setLogoPreview(data.logo);
    if (data.licence) setLicensePreview(data.licence);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'subscription') {
        setFormData(prev => ({
          ...prev,
          subscription: {
            ...prev.subscription,
            [child]: child === 'amount' ? Number(value) || 0 : value
          }
        }));
      }
    } else {
      let processedValue: string | number | boolean = value;

      if (type === 'number') {
        processedValue = value === '' ? 0 : Number(value);
      } else if (type === 'checkbox') {
        processedValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'date') {
        processedValue = value ? new Date(value).toISOString() : '';
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Single image handlers (logo & licence)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLicensePreview(reader.result as string);
        setFormData(prev => ({ ...prev, licence: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const removeLicense = () => {
    setLicensePreview('');
    setFormData(prev => ({ ...prev, licence: '' }));
  };
  const handleMultipleImagesUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: keyof IHospitalFormData['images']
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentCount = formData.images[category].length;
    const remainingSlots = MAX_IMAGES_PER_CATEGORY - currentCount;

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES_PER_CATEGORY} images allowed in this category`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setFormData(prev => ({
              ...prev,
              images: {
                ...prev.images,
                [category]: [...prev.images[category], reader.result as string]
              }
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Only image files are allowed');
      }
    });

    if (files.length > remainingSlots) {
      toast(`Only ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''} added (max ${MAX_IMAGES_PER_CATEGORY} per category)`);
    }
  };

  const removeGalleryImage = (category: keyof IHospitalFormData['images'], index: number) => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [category]: prev.images[category].filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.hospitalName?.trim()) newErrors.hospitalName = 'Hospital name is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.since || formData.since < 1900 || formData.since > new Date().getFullYear()) {
      newErrors.since = 'Invalid year';
    }
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.confirmPassword) {
      newErrors.password = 'Please enter a password first';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const requestFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        // Never send confirmPassword to backend
        if (key === 'confirmPassword') return;
        // Skip password if empty (user didn't want to change it)
        if (key === 'password' && !value) return;

        if (key === 'subscription' || key === 'images') {
          requestFormData.append(key, JSON.stringify(value));
        } else if (key === 'logo' || key === 'licence') {
          requestFormData.append(key, value as string);
        } else {
          requestFormData.append(key, String(value));
        }
      });
      console.log(requestFormData)
      const response = await hospitalApi.editHospital(hospitalId, requestFormData);
console.log(response)
      if (response.status === 200 || response.status === 204) {

        toast.success('Hospital information updated successfully!');
        navigate(HOSPITAL_ROUTES.HOSPITALDASHBOARD);
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to update hospital';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  const renderGallerySection = (
    title: string,
    category: keyof IHospitalFormData['images'],
    icon: React.ReactNode
  ) => {
    const images = formData.images[category];
    const remaining = MAX_IMAGES_PER_CATEGORY - images.length;

    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          {icon}
          {title} ({images.length}/{MAX_IMAGES_PER_CATEGORY})
        </h3>

        <label className="block cursor-pointer mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={remaining <= 0}
              onChange={(e) => handleMultipleImagesUpload(e, category)}
              className="hidden"
            />
            <Upload
              size={24}
              className={`mx-auto mb-2 ${remaining > 0 ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-300'} transition`}
            />
            <p className={`text-sm font-medium ${remaining > 0 ? 'text-gray-600' : 'text-gray-400'}`}>
              {remaining > 0
                ? `Add ${title.toLowerCase()} images (${remaining} slot${remaining > 1 ? 's' : ''} left)`
                : 'Maximum limit reached'}
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max 3 per category)</p>
          </div>
        </label>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((imgSrc, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={imgSrc}
                  alt={`${title} ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(category, idx)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleCancel}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Hospitals</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Building2 className="w-8 h-8" />
                Edit Hospital Information
              </h1>
              <p className="text-blue-100 mt-2">Update hospital details and settings</p>
              {hospitalId && (
                <p className="text-blue-200 text-sm mt-1">Hospital ID: {hospitalId}</p>
              )}
            </div>

            <div className="p-8">
              {/* Logo Upload Section */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-6">Hospital Logo</h2>
                <div className="flex flex-col items-center">
                  <label className="w-full max-w-md cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Upload size={32} className="mx-auto mb-3 text-gray-400 group-hover:text-blue-500 transition" />
                      <p className="text-sm font-medium text-gray-600">
                        {logoPreview || formData.logo ? "Change hospital logo" : "Upload hospital logo"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
                    </div>
                  </label>

                  {(logoPreview || formData.logo) && (
                    <div className="mt-6 w-full max-w-md">
                      <div className="relative">
                        <img
                          src={logoPreview || formData.logo}
                          alt="Hospital Logo"
                          className="w-full h-48 object-contain rounded-lg border-2 border-gray-200 bg-gray-50 p-4"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="hospitalName"
                        value={formData.hospitalName}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.hospitalName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter hospital name"
                      />
                    </div>
                    {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="hospital@example.com"
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="+1234567890"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="e.g. 680001 (Thrissur) or 110001 (Delhi)"
                      />
                    </div>
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter complete address"
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Established Since *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="number"
                        name="since"
                        value={formData.since}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.since ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="2010"
                      />
                    </div>
                    {errors.since && <p className="text-red-500 text-xs mt-1">{errors.since}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">License Document</label>
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                        <input type="file" accept="image/*" onChange={handleLicenseUpload} className="hidden" />
                        <Upload size={24} className="mx-auto mb-2 text-gray-400 group-hover:text-blue-500 transition" />
                        <p className="text-sm font-medium text-gray-600">
                          {licensePreview ? "Change licence" : "Upload licence"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG or GIF (max 5MB)</p>
                      </div>
                    </label>
                    {licensePreview && (
                      <div className="mt-4 relative">
                        <img
                          src={licensePreview}
                          alt="License"
                          className="w-full h-32 object-contain rounded-lg border-2 border-gray-200 bg-gray-50 p-2"
                        />
                        <button
                          type="button"
                          onClick={removeLicense}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About Hospital</label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description about your hospital..."
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Hospital is Active
                  </label>
                </div>
              </div>

              {/* Password Section */}
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Change Password</h2>
                <p className="text-sm text-gray-500 -mt-2">Leave blank if you don't want to change the password</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="mt-10 space-y-8">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Gallery Images</h2>
                <p className="text-sm text-gray-600 -mt-2 mb-6">
                  Upload up to 3 photos per category to showcase your hospital
                </p>

                {renderGallerySection(
                  "Landscape / Building Views",
                  "landscape",
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                )}

                {renderGallerySection(
                  "Medical Team",
                  "medicalTeam",
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                )}

                {renderGallerySection(
                  "Patient Care",
                  "patientCare",
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                )}

                {renderGallerySection(
                  "Services & Facilities",
                  "services",
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex gap-4 justify-end border-t pt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalEdit;