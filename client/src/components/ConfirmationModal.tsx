import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'info'
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };

    const iconColors = {
        danger: 'text-red-600 bg-red-100',
        warning: 'text-yellow-600 bg-yellow-100',
        info: 'text-blue-600 bg-blue-100'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconColors[type]}`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="text-gray-600 leading-relaxed pt-2">
                        {message}
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-2.5 rounded-xl text-white font-semibold transition-all shadow-md active:scale-95 ${colorClasses[type]}`}
                    >
                        {confirmText}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
