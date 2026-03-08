import React from 'react';
import { X, User, Phone, Mail, MapPin, Activity, Calendar, Clock, Hash, Shield } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface PatientDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: {
        patientName: string;
        patientAge: number;
        patientAvatar: string;
        tokenNumber: number;
        date: string;
        time: string;
        type: string;
        reason: string;
        bloodPressure?: string;
        heartRate?: string;
        weight?: string;
        phone?: string;
        email?: string;
        address?: string;
    } | null;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ isOpen, onClose, appointment }) => {
    if (!isOpen || !appointment) return null;
    const location = useLocation();
    const isUpcomingPage = location.pathname === '/doctor/upcoming-appointments';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-slate-200">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex items-end">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5 flex-shrink-0" />
                    </button>

                    <div className="flex items-center gap-4 translate-y-8">
                        <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-xl flex-shrink-0">
                            <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl uppercase">
                                {appointment.patientAvatar}
                            </div>
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-bold text-white drop-shadow-sm">{appointment.patientName}</h2>
                            <p className="text-blue-100 text-sm font-medium">Patient Details • {appointment.patientAge} years old</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 pt-12 pb-8 space-y-8 mt-4">

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Token
                            </p>
                            <p className="text-lg font-black text-slate-800">#{appointment.tokenNumber}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Date
                            </p>
                            <p className="text-sm font-bold text-slate-800">{appointment.date}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Time
                            </p>
                            <p className="text-sm font-bold text-slate-800">{appointment.time}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Type
                            </p>
                            <p className="text-sm font-bold text-blue-600">{appointment.type}</p>
                        </div>
                    </div>

                    {/* Core Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Vitals Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-rose-500" />
                                Vitals & Clinical Data
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                                    <span className="text-sm text-slate-600 font-medium">Blood Pressure</span>
                                    <span className="text-sm font-bold text-rose-700">{appointment.bloodPressure || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                    <span className="text-sm text-slate-600 font-medium">Heart Rate</span>
                                    <span className="text-sm font-bold text-blue-700">{appointment.heartRate ? `${appointment.heartRate} bpm` : 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                                    <span className="text-sm text-slate-600 font-medium">Weight</span>
                                    <span className="text-sm font-bold text-emerald-700">{appointment.weight ? `${appointment.weight} kg` : 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Contact Information
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                                        <Phone className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Phone</p>
                                        <p className="text-sm font-semibold text-slate-700">{appointment.phone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                                        <Mail className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Email</p>
                                        <p className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">{appointment.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-slate-100 rounded-lg">
                                        <MapPin className="w-4 h-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Address</p>
                                        <p className="text-sm font-semibold text-slate-700 leading-relaxed capitalize">{appointment.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason Section */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Reason for Visit</h3>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            {appointment.reason || 'No specific reason provided for this consultation.'}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                        Close Profile
                    </button>
                  <div>
      
      {!isUpcomingPage && (
        <button
          className="px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          Start Consultation
        </button>
      )}
    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsModal;
