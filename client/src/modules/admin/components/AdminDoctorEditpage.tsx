import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Camera, Save, X, AlertCircle, FileText } from 'lucide-react';
import type { ChangeEvent } from 'react';
import api from '@/lib/api';
import axios from 'axios';
import type{ IDoctor } from '@/interfaces/IDoctor';
import toast from 'react-hot-toast';



interface DoctorFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  qualification: string;
  experience: string;
  department: string;
  licence: string;
  licenseImage: string;          
  about: string;
  profileImage: string;
  isActive: boolean;
  isAccountVerified: boolean;
  consultationTime: {
    start: string;
    end: string;
  };
  payment: {
    type: 'commission' | 'fixed';
    commissionPercentage: string;
    fixedSalary: string;
    payoutCycle: 'weekly' | 'monthly';
    patientsPerDayLimit: string;
  };
}

const getEmptyForm = (): DoctorFormData => ({
  name: '',
  email: '',
  phone: '',
  address: '',
  specialization: '',
  qualification: '',
  experience: '',
  department: '',
  licence: '',
  licenseImage: '',               // ← ADDED
  about: '',
  profileImage: '',
  isActive: false,
  isAccountVerified: false,
  consultationTime: { start: '', end: '' },
  payment: {
    type: 'commission',
    commissionPercentage: '',
    fixedSalary: '',
    payoutCycle: 'monthly',
    patientsPerDayLimit: '',
  },
});

const AdminDoctorEditPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<DoctorFormData>(getEmptyForm());
  const [imagePreview, setImagePreview] = useState<string>('');
  const [licensePreview, setLicensePreview] = useState<string>('');  // ← ADDED
  const [errors, setErrors] = useState<Partial<Record<keyof DoctorFormData | string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const doctor = state?.doctor as IDoctor | undefined;

    if (!doctor || !doctor._id) {
      alert('No doctor data received');
      navigate(-1);
      return;
    }

    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      address: doctor.address || '',
      specialization: doctor.specialization || '',
      qualification: doctor.qualification || '',
      experience: String(doctor.experience || ''),
      department: doctor.department || '',
      licence: doctor.licence || '',
      licenseImage: doctor.licence || '',          // ← ADDED
      about: doctor.about || '',
      profileImage: doctor.profileImage || '',
      isActive: !!doctor.isActive,
      isAccountVerified: !!doctor.isAccountVerified,
      consultationTime: {
        start: doctor.consultationTime?.start || '',
        end: doctor.consultationTime?.end || '',
      },
      payment: {
        type: doctor.payment?.type || 'commission',
        commissionPercentage: String(doctor.payment?.commissionPercentage || ''),
        fixedSalary: String(doctor.payment?.fixedSalary || ''),
        payoutCycle: doctor.payment?.payoutCycle || 'monthly',
        patientsPerDayLimit: String(doctor.payment?.patientsPerDayLimit || ''),
      },
    });

    if (doctor.profileImage) setImagePreview(doctor.profileImage);
    if (doctor.licence) setLicensePreview(doctor.licence);   
    setPageLoading(false);
  }, [state, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target.type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;
    const finalValue = isCheckbox ? checked : value;

    setFormData((prev) => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.') as [keyof DoctorFormData, string];
        if (parent === 'consultationTime' || parent === 'payment') {
          return {
            ...prev,
            [parent]: {
              ...prev[parent],
              [child]: finalValue,
            },
          };
        }
        return prev;
      }
      return {
        ...prev,
        [name]: finalValue,
      };
    });

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof typeof errors];
        return next;
      });
    }
  };

  const handleProfileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profileImage: 'Image must be under 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, profileImage: result }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.profileImage;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleLicenseImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, licenseImage: 'File must be under 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setLicensePreview(result);
      setFormData((prev) => ({ ...prev, licenseImage: result }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.licenseImage;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof DoctorFormData | string, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';

    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.licence.trim()) newErrors.licence = 'License number is required';
    if (!formData.about.trim()) newErrors.about = 'About is required';

    // License image validation
    if (!formData.licenseImage && !licensePreview) {
      newErrors.licenseImage = 'Medical license document is required';
    }

    if (!formData.profileImage && !imagePreview) {
      newErrors.profileImage = 'Profile image is required';
    }

    if (formData.payment.type === 'commission' && !formData.payment.commissionPercentage.trim()) {
      newErrors['payment.commissionPercentage'] = 'Commission % is required';
    }
    if (formData.payment.type === 'fixed' && !formData.payment.fixedSalary.trim()) {
      newErrors['payment.fixedSalary'] = 'Fixed salary is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.patch(
        `/api/doctor/doctorEdit/${state?.doctor?._id}`,
        formData
      );

      if (response.status === 200 || response.status === 204) {
        toast.success('Doctor updated successfully!');
        navigate(-1);
      }
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        const serverMessage = err.response?.data?.message;
        toast.error(serverMessage || 'Failed to update doctor');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const ErrorMsg = ({ msg }: { msg?: string }) =>
    msg ? (
      <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1">
        <AlertCircle size={14} />
        <span>{msg}</span>
      </div>
    ) : null;

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading doctor information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-xl overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Doctor Profile</h1>
          </div>

          <div className="p-6 space-y-8">

            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer shadow-md">
                  <Camera size={16} />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                  />
                </label>
              </div>
              <ErrorMsg msg={errors.profileImage} />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.email} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.phone} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medical License Number *</label>
                <input name="licence" value={formData.licence} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.licence} />
              </div>
            </div>

            {/* License Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Medical License Document *</label>

              {licensePreview || formData.licenseImage ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={licensePreview || formData.licenseImage}
                      alt="Medical License"
                      className="max-h-96 w-full object-contain mx-auto p-2"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <label className="cursor-pointer inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Camera size={18} className="mr-2" />
                      Change Document
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleLicenseImageChange}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setLicensePreview('');
                        setFormData(prev => ({ ...prev, licenseImage: '' }));
                      }}
                      className="inline-flex items-center px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X size={18} className="mr-2" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:bg-gray-50 transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-700 font-medium">Click to upload license document</span>
                  <span className="text-sm text-gray-500 mt-2">JPG, PNG, PDF • max 5MB</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleLicenseImageChange}
                  />
                </label>
              )}
              <ErrorMsg msg={errors.licenseImage} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <ErrorMsg msg={errors.address} />
            </div>

            {/* Professional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                <input name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.specialization} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <input name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.department} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                <input name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.qualification} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                <input name="experience" value={formData.experience} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                <ErrorMsg msg={errors.experience} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Doctor *</label>
              <textarea name="about" value={formData.about} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              <ErrorMsg msg={errors.about} />
            </div>

            {/* Consultation Time */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Consultation Time</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" name="consultationTime.start" value={formData.consultationTime.start} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" name="consultationTime.end" value={formData.consultationTime.end} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Payment Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <select name="payment.type" value={formData.payment.type} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="commission">Commission Based</option>
                    <option value="fixed">Fixed Salary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout Cycle</label>
                  <select name="payment.payoutCycle" value={formData.payment.payoutCycle} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                {formData.payment.type === 'commission' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission %</label>
                    <input type="number" name="payment.commissionPercentage" value={formData.payment.commissionPercentage} onChange={handleInputChange} min="0" max="100" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <ErrorMsg msg={errors['payment.commissionPercentage']} />
                  </div>
                )}

                {formData.payment.type === 'fixed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Salary</label>
                    <input type="number" name="payment.fixedSalary" value={formData.payment.fixedSalary} onChange={handleInputChange} min="0" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    <ErrorMsg msg={errors['payment.fixedSalary']} />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Patients / Day</label>
                  <input type="number" name="payment.patientsPerDayLimit" value={formData.payment.patientsPerDayLimit} onChange={handleInputChange} min="1" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">Active Account</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" name="isAccountVerified" checked={formData.isAccountVerified} onChange={handleInputChange} className="w-5 h-5 text-blue-600 rounded" />
                  <span className="text-gray-700">Account Verified</span>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex-1 sm:flex-none py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X size={18} className="inline mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorEditPage;