import { useState } from 'react';
import { X, TrendingUp, DollarSign, FileText } from 'lucide-react';
import { useAppSelector } from '@/hooks/redux';
import type { DoctorProfile } from '@/store/auth/auth.type';
import { doctorApi } from '@/constants/backend/doctor/doctor.api';
import type { SalaryHikeRequestinterface } from '@/interfaces/IDoctor';
import toast from 'react-hot-toast';
import axios from 'axios';

interface SalaryHikeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName?: string;
  currentSalary?: number;
}

const SalaryHikeRequestModal = ({
  isOpen,
  onClose,
}: SalaryHikeRequestModalProps) => {
  const [requestedSalary, setRequestedSalary] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const doctor = useAppSelector((state) => state.auth.profileData);
  const doctorName = doctor?.name;
  const doctorId = doctor?.id;
  const hospitalId = (doctor as DoctorProfile)?.hospital_id;
  const currentSalary = (doctor as DoctorProfile)?.salary || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestedSalary || parseFloat(requestedSalary) <= currentSalary) {
      setError('Requested salary must be higher than current salary');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the salary hike request');
      return;
    }

    const data = {
      doctorId,
      hospitalId,
      requestedSalary,
      currentSalary,
      reason,
    };

    try {
      const response = await doctorApi.salaryIncreaseRequest(data as SalaryHikeRequestinterface);
      console.log(response.data,"hiii");

      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
        setRequestedSalary('');
        setReason('');
        setError('');
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } catch (error) {
        
        if (axios.isAxiosError(error) && error.response) {
      const message =
        error.response.data?.message || 'Request failed. Please try again.';
      toast.error(message);
    } else {
      toast.error('Something went wrong. Please try again.');
    }

    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Request Salary Hike</h2>
              <p className="text-sm text-slate-500">{doctorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Current fee per consultation
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <DollarSign className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700 tabular-nums">
                ₹{currentSalary.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Requested Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Requested Fee per Consultation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
              <input
                type="number"
                value={requestedSalary}
                onChange={(e) => {
                  setRequestedSalary(e.target.value);
                  setError('');
                }}
                placeholder="Enter desired fee per consultation"
                className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
              />
            </div>
          </div>

          {/* Reason for Hike */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Reason for Fee Hike <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Explain why you deserve a fee increase"
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[120px]"
            />
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryHikeRequestModal;