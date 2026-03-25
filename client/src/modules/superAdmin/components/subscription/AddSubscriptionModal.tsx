import React, { useState } from 'react';
import { X, Plus, CreditCard, Clock } from 'lucide-react';
import { showToast } from '@/utils/toastUtils';
import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';

interface AddSubscriptionForm {
  planName: string;
  duration: string;
  durationUnit: 'months' | 'years';
  amount: string;
  description: string;
}

interface FormErrors {
  planName?: string;
  duration?: string;
  amount?: string;
  description?: string;
}

const EMPTY_FORM: AddSubscriptionForm = {
  planName: '',
  duration: '',
  durationUnit: 'months',
  amount: '',
  description: '',
};

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState<AddSubscriptionForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof AddSubscriptionForm,
    value: string
  ) => {
    const updated = { ...form, [field]: value };
    setForm(updated);

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.planName.trim()) newErrors.planName = 'Plan name is required.';
    if (!form.description.trim()) newErrors.description = 'Description is required.';
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) < 1) {
      newErrors.duration = 'Duration must be a positive number.';
    }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <0) {
      newErrors.amount = 'Amount must be a positive number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      await superAdminApi.createSubscription({
        planName: form.planName.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        durationUnit: form.durationUnit,
        amount: Number(form.amount),
      });

      showToast.success('Subscription plan created successfully!');

      setForm(EMPTY_FORM);
      setErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create subscription:', error);
      showToast.error('Failed to create subscription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Add Subscription Plan</p>
              <p className="text-xs text-slate-400">Fill in the plan details below</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">

          {/* Plan Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Plan Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Premium Plan"
              value={form.planName}
              onChange={(e) => handleChange('planName', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.planName
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
            />
            {errors.planName && <p className="text-xs font-bold text-rose-500">{errors.planName}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              About this Plan <span className="text-rose-500">*</span>
            </label>
           <textarea
  placeholder="e.g. Unlimited consultations, lab tests and medicines"
  value={form.description}
  onChange={(e) => handleChange('description', e.target.value)}
  rows={4} 
  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all resize-none ${
    errors.description
      ? 'border-rose-500 focus:ring-rose-500/20'
      : 'border-slate-200 focus:ring-indigo-500/20'
  }`}
/>
            {errors.description && <p className="text-xs font-bold text-rose-500">{errors.description}</p>}
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Duration <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.duration
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              <select
                value={form.durationUnit}
                onChange={(e) => handleChange('durationUnit', e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            {errors.duration && <p className="text-xs font-bold text-rose-500">{errors.duration}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 4999"
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                errors.amount
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:ring-indigo-500/20'
              }`}
            />
            {errors.amount && <p className="text-xs font-bold text-rose-500">{errors.amount}</p>}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 bg-slate-50">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubscriptionModal;