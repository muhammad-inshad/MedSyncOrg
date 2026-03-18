import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  CreditCard, Calendar, DollarSign, Tag,
  ArrowLeft, Save, X, PencilLine, Users
} from 'lucide-react';

import { useNavigate, useLocation } from 'react-router-dom';
import SuperAdminSidebar from '../SuperAdminsidebar';
import toast from 'react-hot-toast';
import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';
import { AxiosError } from 'axios';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import type { SubscriptionForm } from '@/interfaces/ISubscription';

interface FormErrors {
  [key: string]: string;
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  cancelled: { label: 'Cancelled', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
};

const EditSubscription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const subscription = location.state?.subscription as SubscriptionForm;

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [subscriptionId, setSubscriptionId] = useState<string>('');

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

  useEffect(() => {
    if (!subscription) {
      toast.error('No subscription data found');
      navigate(-1);
      return;
    }
    const id = (subscription as any).id || (subscription as any)._id || '';
    setSubscriptionId(String(id));
    setForm({
      plan: subscription.plan || '',
      amount: subscription.amount || 0,
      status: subscription.status || 'active',
      duration: subscription.duration || 1,
      durationUnit: subscription.durationUnit || 'months',
      paymentId: subscription.paymentId || '',
      paymentMethod: subscription.paymentMethod || '',
      limits: {
        maxPatients: subscription.limits?.maxPatients ?? 0,
        maxDoctors: subscription.limits?.maxDoctors ?? 0,
        maxDepartments: subscription.limits?.maxDepartments ?? 0,
      },
    });
  }, [subscription, navigate]);

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
  };

  const validate = (): boolean => {
    const subscriptionSchema = z.object({
      plan: z.string().min(1, 'Plan name is required'),
      amount: z.number().nonnegative('Amount must be zero or positive'),
      status: z.enum(['active', 'expired', 'cancelled']),
      duration: z.number().positive('Duration must be positive'),
      durationUnit: z.enum(['months', 'years']),
      paymentId: z.string().optional(),
      paymentMethod: z.string().optional(),
      limits: z.object({
        maxPatients: z.number().int().nonnegative('Max patients must be a non-negative integer'),
        maxDoctors: z.number().int().nonnegative('Max doctors must be a non-negative integer'),
        maxDepartments: z.number().int().nonnegative('Max departments must be a non-negative integer'),
      }),
    });

    const validation = subscriptionSchema.safeParse(form);

    if (!validation.success) {
      const newErrors: FormErrors = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path.length > 1) {
          newErrors[issue.path.join('.')] = issue.message;
        } else {
          newErrors[issue.path[0] as keyof SubscriptionForm] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const response = await superAdminApi.editSubscription(subscriptionId, form);
      if (response.status === 200 || response.status === 204) {
        toast.success('Subscription updated successfully!');
        navigate(SUPERADMIN_ROUTES.SUBSCRIPTIONS);
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'Failed to update subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const statusCfg = STATUS_CONFIG[form.status] ?? STATUS_CONFIG.active;

  return (
    <div
      className="flex min-h-screen"
      style={{ background: '#f0f4ff', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
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
          <span className="text-sm font-semibold text-slate-700">Edit Plan</span>

          <span
            className={`ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${statusCfg.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          <div className="flex items-start justify-between">
            <div>
              <h1
                className="text-4xl font-black tracking-tight text-slate-800"
                style={{ fontFamily: "'Sora', 'DM Sans', sans-serif", letterSpacing: '-0.03em' }}
              >
                Edit Subscription
              </h1>
              <p className="mt-1 text-slate-500 text-base">
                Modify the plan details below. Changes take effect immediately.
              </p>
              {subscriptionId && (
                <p className="mt-1 text-xs text-slate-400 font-mono">ID: {subscriptionId}</p>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <PencilLine className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Tag className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="font-bold text-slate-800">Plan Details</h2>
            </div>

            <div className="p-8 grid md:grid-cols-2 gap-6">
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
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.plan ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.plan && <p className="text-red-500 text-xs mt-1">{errors.plan}</p>}
              </div>

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
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                      errors.amount ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <h2 className="font-bold text-slate-800">Plan Limits</h2>
            </div>
            <div className="p-8 grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max Patients</label>
                <input
                  type="number"
                  name="limits.maxPatients"
                  value={form.limits?.maxPatients ?? 0}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max Doctors</label>
                <input
                  type="number"
                  name="limits.maxDoctors"
                  value={form.limits?.maxDoctors ?? 0}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max Departments</label>
                <input
                  type="number"
                  name="limits.maxDepartments"
                  value={form.limits?.maxDepartments ?? 0}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />
              </div>
            </div>
          </div>

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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSubscription;