import React, { useEffect, useState } from 'react';
import Navbar from '@/modules/patient/components/Navbar';
import Footer from '../components/Footer';
import jsPDF from 'jspdf';
import {
    Calendar, ChevronRight, X, Pill, FileText,
    Building2, Loader2, ClipboardList, Search, Download
} from 'lucide-react';
import { patientApi } from '@/constants/backend/patient/patient.api';
import Pagination from '@/components/Pagination';
import type { IPrescription } from '@/interfaces/priscription';


const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });


const downloadPrescriptionPdf = (prescription: IPrescription) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 48;
    const contentW = pageW - margin * 2;
    let y = 0;

    // ── Header banner ──────────────────────────────────────────────
    doc.setFillColor(13, 27, 75);
    doc.rect(0, 0, pageW, 80, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('Prescription', margin, 34);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(147, 197, 253);
    doc.text('PATIENT PORTAL', margin, 52);

    doc.setFontSize(10);
    doc.setTextColor(200, 220, 255);
    doc.text(`Issued: ${fmt(prescription.createdAt)}`, pageW - margin, 34, { align: 'right' });
    doc.text(`${prescription.medicines.length} medicine${prescription.medicines.length !== 1 ? 's' : ''}`, pageW - margin, 52, { align: 'right' });

    y = 100;

    // ── Doctor & Hospital ──────────────────────────────────────────
    const cardH = 68;
    const halfW = contentW / 2 - 6;

    // Doctor card
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(margin, y, halfW, cardH, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(59, 130, 246);
    doc.text('DOCTOR', margin + 14, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(prescription.doctor_id.name, margin + 14, y + 36);
    if (prescription.doctor_id.specialization) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(prescription.doctor_id.specialization, margin + 14, y + 52);
    }

    // Hospital card
    const hx = margin + halfW + 12;
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(hx, y, halfW, cardH, 8, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text('HOSPITAL', hx + 14, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(17, 24, 39);
    doc.text(prescription.hospital_id.name, hx + 14, y + 36);
    if (prescription.hospital_id.address) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        const addr = doc.splitTextToSize(prescription.hospital_id.address, halfW - 28);
        doc.text(addr[0], hx + 14, y + 52);
    }

    y += cardH + 28;

    // ── Medicines heading ──────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text('PRESCRIBED MEDICINES', margin, y);
    y += 14;

    // ── Medicine rows ──────────────────────────────────────────────
    prescription.medicines.forEach((med) => {
        const rowH = 62;
        if (y + rowH > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
        }

        doc.setFillColor(239, 246, 255);
        doc.roundedRect(margin, y, contentW, rowH, 8, 8, 'F');

        // Pill badge
        doc.setFillColor(219, 234, 254);
        doc.roundedRect(margin + 14, y + 14, 34, 34, 6, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(37, 99, 235);
        doc.text('Rx', margin + 16, y + 36);

        // Medicine name
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(17, 24, 39);
        doc.text(med.name, margin + 58, y + 26);

        // Labels
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text('DOSAGE', margin + 58, y + 42);
        doc.text('DURATION', margin + 58 + contentW / 3, y + 42);

        // Values
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(29, 78, 216);
        doc.text(med.dosage, margin + 58, y + 55);
        doc.text(med.duration, margin + 58 + contentW / 3, y + 55);

        y += rowH + 10;
    });

    // ── Notes ──────────────────────────────────────────────────────
    if (prescription.notes) {
        if (y + 80 > doc.internal.pageSize.getHeight() - 60) {
            doc.addPage();
            y = margin;
        }
        y += 8;
        doc.setFillColor(255, 251, 235);
        const noteLines = doc.splitTextToSize(prescription.notes, contentW - 28);
        const noteH = Math.max(60, noteLines.length * 14 + 32);
        doc.roundedRect(margin, y, contentW, noteH, 8, 8, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(217, 119, 6);
        doc.text("DOCTOR'S NOTES", margin + 14, y + 18);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(55, 65, 81);
        doc.text(noteLines, margin + 14, y + 34);
    }

    // ── Footer on every page ───────────────────────────────────────
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pgH = doc.internal.pageSize.getHeight();
        doc.setFillColor(243, 244, 246);
        doc.rect(0, pgH - 36, pageW, 36, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text('Generated from Patient Portal', margin, pgH - 14);
        doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pgH - 14, { align: 'right' });
    }

    doc.save(`prescription-${prescription.doctor_id.name.replace(/\s+/g, '-')}-${fmt(prescription.createdAt)}.pdf`);
};


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
                <div className="flex items-center gap-2">
                    {/* Download PDF Button */}
                    <button
                        onClick={() => downloadPrescriptionPdf(prescription)}
                        className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all active:scale-95"
                        title="Download as PDF"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>
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