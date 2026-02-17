import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, XCircle, AlertCircle, Eye, Download, Users, Clock, FileWarning, UserCheck } from 'lucide-react';
import type { IDoctor } from '@/interfaces/IDoctor';

import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 5;

const DoctorKycManagement = () => {
    const [doctors, setDoctors] = useState<IDoctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [filter, setFilter] = useState<'all' | 'pending' | 'rejected' | 'revision'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showZoomModal, setShowZoomModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchDoctors = async (page: number) => {
        setIsLoading(true);
        try {
            const response = await api.get('/api/admin/getalldoctors', {
                params: {
                    page,
                    limit: ITEMS_PER_PAGE,
                    search: searchQuery,
                    filter: filter,
                    isKyc: true
                }
            });
            const { data, totalPages } = response.data;
            setDoctors(Array.isArray(data) ? data : []);
            setTotalPages(totalPages || 0);
            setCurrentPage(page);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch doctors';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchDoctors(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filter]);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            let endpoint = '';
            const payload: { reason?: string } = {};

            if (status === 'approved') {
                endpoint = `/api/admin/doctorAccept/${id}`;
            } else if (status === 'rejected') {
                if (!rejectionReason.trim()) {
                    toast.error("Please provide a reason for rejection");
                    return;
                }
                endpoint = `/api/admin/doctorReject/${id}`;
                payload.reason = rejectionReason;
            } else if (status === 'revision') {
                if (!rejectionReason.trim()) {
                    toast.error("Please provide a reason for revision");
                    return;
                }
                endpoint = `/api/admin/doctorRevision/${id}`;
                payload.reason = rejectionReason;
            }

            await api.patch(endpoint, payload);
            toast.success(`Doctor ${status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Revision Requested'}`);

            fetchDoctors(currentPage);
            setShowModal(false);
            setSelectedDoctor(null);
            setRejectionReason('');
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Action failed';
            toast.error(message);
        }
    };


    const getStatusBadge = (status: string | undefined) => {
        const styles = {
            pending: 'bg-blue-100 text-blue-700 border-blue-200',
            approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            rejected: 'bg-rose-100 text-rose-700 border-rose-200',
            revision: 'bg-amber-100 text-amber-700 border-amber-200',
        };

        const labels = {
            pending: 'Pending Review',
            approved: 'Verified',
            rejected: 'Rejected',
            revision: 'Needs Revision',
        };

        const currentStatus = status || 'pending';

        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[currentStatus as keyof typeof styles] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {labels[currentStatus as keyof typeof labels] || currentStatus}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor KYC Management</h1>
                        <p className="text-slate-500 mt-1">Review and verify doctor professional credentials.</p>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Applications', value: doctors.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
                        { label: 'Pending Review', value: doctors.filter(d => d.reviewStatus === 'pending').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100/50' },
                        { label: 'Needs Revision', value: doctors.filter(d => d.reviewStatus === 'revision').length, icon: FileWarning, color: 'text-amber-600', bg: 'bg-amber-100/50' },
                        { label: 'Verified Doctors', value: doctors.filter(d => d.reviewStatus === 'approved').length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-all hover:shadow-md">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter Tabs */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 inline-flex flex-wrap gap-1">
                    {(['all', 'pending', 'revision', 'rejected'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setFilter(tab);
                                setCurrentPage(1);
                            }}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${filter === tab
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <span className="capitalize">{tab === 'revision' ? 'Revision' : tab}</span>
                            {tab !== 'all' && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${filter === tab ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {doctors.filter((d) => d.reviewStatus === tab).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {isLoading ? (
                        <div className="py-20 text-center text-slate-400 font-medium">Loading applications...</div>
                    ) : doctors.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
                            <p className="text-slate-500">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Details</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qualification</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Submitted</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {doctors.map((doc: IDoctor) => (
                                            <tr key={doc._id} className="hover:bg-slate-50/50 transition-all group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <img src={doc.profileImage} alt={doc.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all" />
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-900 uppercase">Dr. {doc.name}</div>
                                                            <div className="text-xs text-slate-400 font-bold">{doc.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-slate-700 uppercase">{doc.qualification}</div>
                                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{doc.specialization}</div>
                                                </td>
                                                <td className="px-6 py-4">{getStatusBadge(doc.reviewStatus)}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                    {new Date(doc.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDoctor(doc);
                                                            setShowModal(true);
                                                        }}
                                                        className="flex items-center gap-2 text-blue-600 hover:text-white text-xs font-bold bg-blue-50 hover:bg-blue-600 px-3 py-2 rounded-lg transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Review
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            {showModal && selectedDoctor && (
                <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl transition-all">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 uppercase">Credential Review</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setRejectionReason('');
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all font-bold"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Doctor Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-1">
                                    <div className="relative group mx-auto w-40 h-40">
                                        <img
                                            src={selectedDoctor.profileImage}
                                            alt="Doctor Profile"
                                            className="w-full h-full object-cover rounded-3xl shadow-lg ring-4 ring-slate-50 group-hover:ring-blue-50 transition-all"
                                        />
                                        <div className="absolute inset-0 rounded-3xl bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                                            <Eye className="text-white w-8 h-8" />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                                        <p className="text-slate-900 font-bold uppercase leading-tight">Dr. {selectedDoctor.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                                        <p className="text-slate-900 font-bold tabular-nums">{selectedDoctor.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</label>
                                        <p className="text-slate-900 font-bold tabular-nums">{selectedDoctor.phone}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
                                        <p className="text-slate-900 font-bold uppercase">{selectedDoctor.department}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                                        <p className="text-slate-900 font-bold text-sm uppercase leading-relaxed">{selectedDoctor.address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Credentials Section */}
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-500" />
                                    Professional Credentials
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                                        <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Qualification</label>
                                        <p className="text-slate-900 font-bold text-lg uppercase leading-tight">{selectedDoctor.qualification}</p>
                                    </div>
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                                        <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Experience</label>
                                        <p className="text-slate-900 font-bold text-lg tabular-nums">{selectedDoctor.experience} Years</p>
                                    </div>
                                </div>

                                {selectedDoctor.licence ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-600 uppercase">Medical License Document</label>
                                            <a
                                                href={selectedDoctor.licence}
                                                download={`dr-${selectedDoctor.name}-licence.jpg`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all uppercase"
                                            >
                                                <Download className="w-4 h-4" /> Download Original
                                            </a>
                                        </div>
                                        <div
                                            className="group relative cursor-pointer border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 transition-all bg-slate-50"
                                            onClick={() => setShowZoomModal(true)}
                                        >
                                            <img
                                                src={selectedDoctor.licence}
                                                alt="Medical License"
                                                className="w-full h-80 object-contain p-4 group-hover:scale-[1.02] transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                                <div className="p-3 bg-white rounded-full text-slate-900 shadow-xl">
                                                    <Eye className="w-6 h-6" />
                                                </div>
                                                <span className="text-white font-bold text-sm shadow-sm uppercase">Click to magnify</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-10 text-center">
                                        <FileWarning className="w-12 h-12 text-rose-300 mx-auto mb-3" />
                                        <p className="text-rose-600 font-bold uppercase">No medical license uploaded.</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Section */}
                            {selectedDoctor.reviewStatus !== 'approved' && (
                                <div className="pt-10 border-t border-slate-100 space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-tight">
                                            Feedback / Reason (Required for Revision or Rejection)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder={selectedDoctor.rejectionReason || "Provide detailed feedback on why the application needs revision or is being rejected..."}
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[140px] resize-none text-slate-600 font-medium"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => handleStatusUpdate(selectedDoctor._id, "approved")}
                                            className="flex-1 bg-emerald-600 text-white px-8 py-4 rounded-2xl hover:bg-emerald-700 font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve & Verify
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedDoctor._id, 'revision')}
                                            className="flex-1 bg-amber-500 text-white px-8 py-4 rounded-2xl hover:bg-amber-600 font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider"
                                        >
                                            <Clock className="w-5 h-5" />
                                            Request Revision
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedDoctor._id, 'rejected')}
                                            className="flex-1 bg-rose-600 text-white px-8 py-4 rounded-2xl hover:bg-rose-700 font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95 uppercase text-sm tracking-wider"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Temporarily
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedDoctor.reviewStatus === 'approved' && (
                                <div className="flex items-center justify-center gap-3 py-10 text-emerald-700 font-bold text-xl bg-emerald-50 rounded-2xl border border-emerald-100 uppercase tracking-widest">
                                    <CheckCircle className="w-8 h-8" />
                                    Verified & Active Member
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Full-size Image Overlay */}
            {showZoomModal && selectedDoctor?.licence && (
                <div
                    className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[60] p-4 cursor-zoom-out"
                    onClick={() => setShowZoomModal(false)}
                >
                    <div className="relative max-w-5xl w-full flex flex-col items-center">
                        <button
                            onClick={() => setShowZoomModal(false)}
                            className="absolute -top-12 right-0 text-white hover:text-blue-400 transition-colors p-2 font-bold"
                        >
                            <XCircle className="w-10 h-10" />
                        </button>

                        <img
                            src={selectedDoctor.licence}
                            alt="Medical License - Full View"
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        />

                        <div className="mt-8 flex gap-4">
                            <a
                                href={selectedDoctor.licence}
                                download={`full-dr-${selectedDoctor.name}-licence.jpg`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl hover:bg-blue-700 font-bold transition-all shadow-xl shadow-blue-600/30 flex items-center gap-2 uppercase text-sm tracking-widest"
                            >
                                <Download className="w-5 h-5" /> Download Document
                            </a>
                            <button
                                onClick={() => setShowZoomModal(false)}
                                className="bg-white/10 text-white px-8 py-3.5 rounded-2xl hover:bg-white/20 font-bold transition-all border border-white/20 uppercase text-sm tracking-widest"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorKycManagement;
