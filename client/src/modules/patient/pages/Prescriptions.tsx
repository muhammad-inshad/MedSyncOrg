import React, { useEffect, useState } from 'react';
import Navbar from '@/modules/patient/components/Navbar';
import Footer from '../components/Footer';
import {
    Calendar, ChevronRight, X, Pill, FileText,
    Building2, Loader2, ClipboardList, Clock, Search
} from 'lucide-react';
import { patientApi } from '@/constants/backend/patient/patient.api';
import Pagination from '@/components/Pagination';
import type { IMedicine, IPrescription } from '@/interfaces/priscription';


const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });


const MedicineBadge = ({ med }: { med: IMedicine }) => (
    <div className="flex items-start gap-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/70 hover:bg-blue-50 transition-colors">
        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Pill className="w-4 h-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-sm leading-tight truncate">{med.name}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                <span className="text-xs font-semibold text-blue-600">{med.dosage}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{med.duration}</span>
            </div>
        </div>
    </div>
);

const DetailModal = ({
    prescription,
    onClose,
}: {
    prescription: IPrescription;
    onClose: () => void;
}) => (
    <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md"
        onClick={onClose}
    >
        <div
            className="bg-white w-full sm:max-w-2xl max-h-[92vh] overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
        >
            {/* Modal Header */}
            <div
                className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 border-b border-gray-100"
                style={{ background: 'linear-gradient(135deg, #0d1b4b, #1a3a7c)' }}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/10 rounded-2xl flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-white font-bold text-lg tracking-tight">Prescription Details</h2>
                </div>
                <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto max-h-[calc(92vh-73px)]">
                {/* Doctor & Hospital Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Doctor Card */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-[#f0f5ff]">
                        <img
                            src={prescription.doctor_id.profileImage || 'https://via.placeholder.com/64'}
                            alt={prescription.doctor_id.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">DOCTOR</p>
                            <p className="font-bold text-gray-900 text-lg leading-tight">{prescription.doctor_id.name}</p>
                            {prescription.doctor_id.specialization && (
                                <p className="text-sm text-gray-600 mt-0.5">{prescription.doctor_id.specialization}</p>
                            )}
                        </div>
                    </div>

                    {/* Hospital Card */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-[#f0fdf4]">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-7 h-7 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">HOSPITAL</p>
                            <p className="font-bold text-gray-900 text-lg leading-tight">{prescription.hospital_id.name}</p>
                            {prescription.hospital_id.address && (
                                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{prescription.hospital_id.address}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Date Issued', val: fmt(prescription.createdAt), Icon: Calendar },
                        { label: 'Medicines', val: `${prescription.medicines.length} item${prescription.medicines.length !== 1 ? 's' : ''}`, Icon: Pill },
                    ].map(({ label, val, Icon }) => (
                        <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-sm transition-shadow">
                            <Icon className="w-5 h-5 mx-auto mb-3 text-blue-500" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                            <p className="font-bold text-gray-800 text-base">{val}</p>
                        </div>
                    ))}
                </div>
<div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 pl-1">
                        PRESCRIBED MEDICINES
                    </h3>

                    <div className="space-y-4">
                        {prescription.medicines.map((med, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 p-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Pill className="w-5 h-5 text-blue-600" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 text-lg leading-tight mb-3">
                                        {med.name}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">DOSAGE</p>
                                            <p className="font-semibold text-blue-700">{med.dosage}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs font-medium">DURATION</p>
                                            <p className="font-semibold text-blue-700">{med.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Notes */}
                {prescription.notes && (
                    <div className="rounded-2xl p-6 border border-amber-100 bg-[#fffbeb]">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-5 h-5 text-amber-500" />
                            <p className="text-sm font-bold uppercase tracking-widest text-amber-600">Doctor's Notes</p>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-[15px]">{prescription.notes}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const Prescriptions = () => {
    const [prescriptions, setPrescriptions] = useState<IPrescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selected, setSelected] = useState<IPrescription | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await patientApi.getPrescriptions(currentPage, limit, debouncedSearch);
                const responseData = result.data;
                if (responseData.success) {
                    setPrescriptions(responseData.data);
                    setTotalPages(responseData.pagination?.totalPages || 1);
                } else {
                    setPrescriptions([]);
                }
            } catch (err) {
                console.error('Failed to fetch prescriptions', err);
                setPrescriptions([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentPage, debouncedSearch]);

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fa]">
            <Navbar />

            {/* Hero Banner */}
            <div
                className="relative h-60 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a7c 60%, #1a6fa8 100%)' }}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.08) 30px, rgba(255,255,255,0.08) 60px)',
                    }}
                />
                <div className="relative h-full flex items-center px-6 md:px-20">
                    <div>
                        <p className="text-blue-300 text-sm font-semibold uppercase tracking-[2px] mb-2">
                            PATIENT PORTAL
                        </p>
                        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
                            My Prescriptions
                        </h1>
                        <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-sky-400 to-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-10">
                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by doctor name or hospital..."
                            className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-sm placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none shadow-sm"
                        />
                    </div>
                </div>

                {/* Prescription List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-28 text-gray-400">
                        <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
                        <p className="font-medium text-lg">Loading your prescriptions...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {prescriptions.length === 0 && (
                            <div className="text-center py-24 text-gray-400">
                                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-40" />
                                <p className="font-medium text-xl">No prescriptions found</p>
                                <p className="text-sm mt-2">Try adjusting your search</p>
                            </div>
                        )}

                        {prescriptions.map(rx => (
                            <div
                                key={rx._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-5 px-6 py-6">
                                    {/* Doctor Avatar */}
                                    <img
                                        src={rx.doctor_id.profileImage || 'https://via.placeholder.com/64'}
                                        alt={rx.doctor_id.name}
                                        className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100 flex-shrink-0"
                                    />

                                    {/* Info Section */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="font-bold text-xl text-gray-900">
                                                Dr. {rx.doctor_id.name}
                                            </span>
                                            {rx.doctor_id.specialization && (
                                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                    {rx.doctor_id.specialization}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                            <span className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-emerald-500" />
                                                {rx.hospital_id.name}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {fmt(rx.createdAt)}
                                            </span>
                                            <span className="flex items-center gap-2">
                                                <Pill className="w-4 h-4 text-indigo-400" />
                                                {rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <button
                                        onClick={() => setSelected(rx)}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl border transition-all active:scale-95"
                                        style={{
                                            color: '#1a3a7c',
                                            borderColor: '#bfdbfe',
                                            backgroundColor: '#eff6ff'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.backgroundColor = '#1a3a7c';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.borderColor = '#1a3a7c';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.backgroundColor = '#eff6ff';
                                            e.currentTarget.style.color = '#1a3a7c';
                                            e.currentTarget.style.borderColor = '#bfdbfe';
                                        }}
                                    >
                                        <FileText className="w-4 h-4" />
                                        View Details
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />

            {/* Detail Modal */}
            {selected && (
                <DetailModal prescription={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
};

export default Prescriptions;