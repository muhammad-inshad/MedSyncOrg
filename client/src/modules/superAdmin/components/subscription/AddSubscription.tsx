import React, { useState } from 'react';
import {
  CreditCard, Calendar, DollarSign, Tag, Zap,
  CheckCircle, ArrowLeft, Save, X, Users, Stethoscope, Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SuperAdminSidebar from '../SuperAdminsidebar';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';
import { AxiosError } from 'axios';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import type { SubscriptionForm } from '@/interfaces/ISubscription';

interface FormErrors {
  [key: string]: string;
}

const PLAN_PRESETS = [
  {
    name: 'Free',
    amount: 0,
    color: 'from-slate-400 to-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    features: ['Basic access', 'Limited records', 'Email support'],
    icon: '🆓',
    limits: { maxPatients: 50, maxDoctors: 2, maxDepartments: 2 },
    duration: 1,
    durationUnit: 'months' as const,
  },
  {
    name: 'Basic',
    amount: 999,
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    features: ['Full patient records', 'Up to 10 doctors', 'Priority support'],
    icon: '⚡',
    limits: { maxPatients: 500, maxDoctors: 10, maxDepartments: 5 },
    duration: 12,
    durationUnit: 'months' as const,
  },
  {
    name: 'Premium',
    amount: 2999,
    color: 'from-violet-600 to-indigo-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-700',
    features: ['Unlimited everything', 'Analytics dashboard', '24/7 support'],
    icon: '👑',
    limits: { maxPatients: 99999, maxDoctors: 99999, maxDepartments: 99999 },
    duration: 1,
    durationUnit: 'years' as const,
  },
];

const AddSubscription = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [form, setForm] = useState<SubscriptionForm>({
    plan: '',
    amount: 0,
    status: 'active',
    duration: 1,
    durationUnit: 'months',
    paymentId: '',
    paymentMethod: '',
    limits: {
      maxPatients: 0,
      maxDoctors: 0,
      maxDepartments: 0,
    },
  });

  const applyPreset = (preset: typeof PLAN_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    setForm(prev => ({
      ...prev,
      plan: preset.name,
      amount: preset.amount,
      duration: preset.duration,
      durationUnit: preset.durationUnit,
      limits: { ...preset.limits },
    }));
    setErrors(prev => ({ ...prev, plan: '', amount: '' }));
  };

  // ✅ Fixed: handles nested keys like "limits.maxPatients"
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof SubscriptionForm] as Record<string, unknown>),
          [child]: Number(value),
        },
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: (name === 'amount' || name === 'duration') ? Number(value) : value,
      }));
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'plan') setSelectedPreset(null);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.plan.trim()) newErrors.plan = 'Plan name is required';
    if (form.amount < 0) newErrors.amount = 'Amount cannot be negative';
    if (form.duration <= 0) newErrors.duration = 'Duration must be positive';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await superAdminApi.addSubscription(form);
      if (response.status === 200 || response.status === 201) {
        toast.success('Subscription plan created successfully!');
        navigate(SUPERADMIN_ROUTES.SUBSCRIPTIONS);
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen" style={{ background: '#f0f4ff', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <SuperAdminSidebar />

      <div className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 flex items-center gap-4 px-8 py-4 border-b border-white/60"
          style={{ background: 'rgba(240,244,255,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm text-slate-400">Subscription Management</span>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm font-semibold text-slate-700">Add New Plan</span>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

          {/* Page heading */}
          <div>
            <h1
              className="text-4xl font-black tracking-tight text-slate-800"
              style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", letterSpacing: '-0.03em' }}
            >
              Create Subscription Plan
            </h1>
            <p className="mt-1 text-slate-500 text-base">
              Design a custom plan and assign it to hospitals.
            </p>
          </div>

          {/* Plan Presets */}
          <section>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Quick Presets
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLAN_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-lg group ${
                    selectedPreset === preset.name
                      ? `${preset.border} shadow-lg scale-[1.02]`
                      : 'border-transparent bg-white hover:border-slate-200'
                  }`}
                >
                  {selectedPreset === preset.name && (
                    <span className="absolute top-3 right-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </span>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${preset.color}`}
                    >
                      {preset.icon}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800">{preset.name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${preset.badge}`}>
                        ₹{preset.amount.toLocaleString()}/yr
                      </span>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {preset.features.map(f => (
                      <li key={f} className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </section>

          {/* Main Form Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="font-bold text-slate-800">Plan Details</h2>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-6">
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Plan Name *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="plan"
                    value={form.plan}
                    onChange={handleChange}
                    placeholder="e.g. Enterprise, Starter..."
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.plan ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    min={0}
                    placeholder="0"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.amount ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Status
                </label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Limits Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-bold text-slate-800">Plan Limits</h2>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-6">
              {/* Max Patients */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Max Patients
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="limits.maxPatients"
                    value={form.limits?.maxPatients ?? 0}
                    onChange={handleChange}
                    min={0}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Max Doctors */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Max Doctors
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="limits.maxDoctors"
                    value={form.limits?.maxDoctors ?? 0}
                    onChange={handleChange}
                    min={0}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
              </div>

              {/* Max Departments */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Max Departments
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="limits.maxDepartments"
                    value={form.limits?.maxDepartments ?? 0}
                    onChange={handleChange}
                    min={0}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Duration Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="font-bold text-slate-800">Validity Period</h2>
              <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                {form.duration} {form.durationUnit}
              </span>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Duration *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  min={1}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                    errors.duration ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Duration Unit *
                </label>
                <select
                  name="durationUnit"
                  value={form.durationUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none"
                >
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary strip */}
          {form.plan && (
            <div className="rounded-2xl p-5 flex flex-wrap items-center gap-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <CreditCard className="w-5 h-5 opacity-80" />
              <span className="font-bold text-lg">{form.plan}</span>
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-semibold">
                ₹{Number(form.amount).toLocaleString()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  form.status === 'active'
                    ? 'bg-emerald-400/30'
                    : form.status === 'expired'
                    ? 'bg-red-400/30'
                    : 'bg-slate-400/30'
                }`}
              >
                {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
              </span>
              {form.limits && (
                <span className="text-sm opacity-75">
                  {form.limits.maxPatients} patients · {form.limits.maxDoctors} doctors · {form.limits.maxDepartments} depts
                </span>
              )}
              <span className="ml-auto text-sm opacity-75">{form.duration} {form.durationUnit} validity</span>
            </div>
          )}


          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-indigo-300"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Creating...' : 'Create Plan'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddSubscription;