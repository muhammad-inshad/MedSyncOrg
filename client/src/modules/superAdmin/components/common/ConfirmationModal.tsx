import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  confirmVariant?: 'danger' | 'success';
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmationModal = ({
  isOpen,
  isLoading = false,
  title,
  description,
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  onClose,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              isDanger ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {isDanger
                ? <AlertTriangle className="w-7 h-7" />
                : <CheckCircle className="w-7 h-7" />
              }
            </div>
            <button
              disabled={isLoading}
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed mb-8">{description}</p>

          <div className="flex gap-4">
            <button
              disabled={isLoading}
              onClick={onClose}
              className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              disabled={isLoading}
              onClick={onConfirm}
              className={`flex-1 h-12 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : 'bg-green-600 hover:bg-green-700 shadow-green-200'
              }`}
            >
              {isLoading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : confirmLabel
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;