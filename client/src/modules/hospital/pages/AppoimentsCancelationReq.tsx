import React, { useEffect, useState } from "react";

import { hospitalApi } from "@/constants/backend/hospital/hospital.api";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";

interface CancellationRequest {
  id: string;
  patient: { name: string; age: number; phone: string; email?: string };
  doctor: { name: string; email: string; specialization: string };
  appointmentDate: string;
  mode: "online" | "offline";
  tokenNumber: number;
  cancelReason: string;
  status: "pending" | "approved" | "rejected" | "processing";
  rejectionReason?: string;
  session?: "morning" | "afternoon" | "evening";
  slotStartTime: string;
  slotEndTime: string;
}

interface RawCancellationItem {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  doctorSpecialization: string;
  appointmentDate: string;
  mode: string;
  tokenNumber: number;
  cancelReason: string;
  status: string;
  rejectionReason?: string;
  session: string;
  slotStartTime: string;
  slotEndTime: string;
}



const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-50 text-amber-600 border border-amber-200",
  approved:   "bg-green-50 text-green-600 border border-green-200",
  rejected:   "bg-red-50   text-red-600   border border-red-200",
  processing: "bg-blue-50  text-blue-600  border border-blue-200",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? ""}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-current" />
    {status}
  </span>
);

const ITEMS_PER_PAGE = 10;

const AppointmentsCancellationReq = () => {
  const [requests, setRequests]               = useState<CancellationRequest[]>([]);
  const [activeFilter, setActiveFilter]       = useState("all");
  const [selectedReq, setSelectedReq]         = useState<CancellationRequest | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError]   = useState(false);
  const [currentPage, setCurrentPage]         = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const res = await hospitalApi.getAppoimentREQCansalation();
      const raw: RawCancellationItem[] = res.data.data;

      const mapped: CancellationRequest[] = raw.map((item) => ({
        id: item.id,                        
        patient: {
          name:  item.patientName,
          age:   item.patientAge,
          phone: item.patientPhone,
          email: item.patientEmail,
        },
        doctor: {
          name:           item.doctorName,
          email:          item.doctorEmail,
          specialization: item.doctorSpecialization,
        },
        appointmentDate: item.appointmentDate,
        mode:            item.mode as "online" | "offline",
        tokenNumber:     item.tokenNumber,
        cancelReason:    item.cancelReason,
        status:          item.status as CancellationRequest["status"],
        rejectionReason: item.rejectionReason ?? "",
        session:         item.session as CancellationRequest["session"],
        slotStartTime:   item.slotStartTime,
        slotEndTime:     item.slotEndTime,
      }));

      setRequests(mapped);
    };

    fetchData();
  }, []);

  const filtered =
    activeFilter === "all"
      ? requests
      : requests.filter((r) => r.status === activeFilter);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );




  const handleApprove = async (id: string) => {
    if (!selectedReq) return;
    try {
     const res= await hospitalApi.approveconcalation(id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "approved", rejectionReason: "" } : r
        )
      );
      toast.success(res.data.message)
    } catch (err) {
      console.error("Approve failed", err);
    }
    closeModal();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { setRejectionError(true); return; }
    if (!selectedReq) return;
    try {
      const res=await hospitalApi.rejectCancellation(selectedReq.id, rejectionReason); 
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedReq.id
            ? { ...r, status: "rejected", rejectionReason }
            : r
        )
      );
      toast.success(res.data.message)
    } catch (err) {
      console.error("Reject failed", err);
    }
    closeModal();
  };

  const closeModal = () => {
    setSelectedReq(null);
    setShowRejectInput(false);
    setRejectionReason("");
    setRejectionError(false);
  };

  const openModal = (req: CancellationRequest) => {
    setSelectedReq(req);
    setShowRejectInput(false);
    setRejectionReason(req.rejectionReason || "");
    setRejectionError(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Cancellation Requests</h1>
      <p className="text-sm text-slate-400 mb-6">
        Review and manage appointment cancellation requests
      </p>

  

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Patient", "Date & Mode", "Cancel Reason", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-slate-400">
                  No requests found
                </td>
              </tr>
            ) : (
              paginated.map((req) => (
                <tr
                  key={req.id}
                  onClick={() => openModal(req)}
                  className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{req.patient.name}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      Age {req.patient.age} · #{req.tokenNumber}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">
                      {new Date(req.appointmentDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {req.session} · {req.mode}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <p className="text-slate-600 truncate text-xs">{req.cancelReason}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); openModal(req); }}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-slate-200 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Modal */}
      {selectedReq && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-7 py-5 text-white relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              >
                ✕
              </button>
              <h2 className="font-bold text-lg">Cancellation Request</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                Token #{selectedReq.tokenNumber} ·{" "}
                {new Date(selectedReq.appointmentDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>

            <div className="p-7">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  {
                    label: "Patient",
                    value: selectedReq.patient.name,
                    sub:   selectedReq.patient.phone,
                  },
                  {
                    label: "Appointment",
                    value: new Date(selectedReq.appointmentDate).toLocaleDateString("en-IN"),
                    sub:   `TOKEN# ${selectedReq.tokenNumber}`,
                  },
                  {
                    label: "Mode · Session",
                    value: `${selectedReq.mode} · ${selectedReq.session}`,
                    sub:   `Status: ${selectedReq.status}`,
                  },
                ].map(({ label, value, sub }) => (
                  <div
                    key={label}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {label}
                    </p>
                    <p className="font-semibold text-slate-800 text-sm capitalize">{value}</p>
                    <p className="text-xs text-slate-400 font-mono">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Cancel Reason */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                  Cancel Reason
                </p>
                <p className="text-sm text-slate-700">{selectedReq.cancelReason}</p>
              </div>

              {/* Rejection Reason Input */}
              {showRejectInput && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      setRejectionError(false);
                    }}
                    placeholder="Provide a reason for rejecting this cancellation request..."
                    className="w-full border border-red-200 bg-red-50 rounded-xl p-3 text-sm text-slate-700 placeholder-red-300 resize-none min-h-[80px] focus:outline-none focus:border-red-400"
                  />
                  {rejectionError && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      Rejection reason is required.
                    </p>
                  )}
                </div>
              )}

              {/* Show stored rejection reason when already rejected */}
              {selectedReq.status === "rejected" &&
                selectedReq.rejectionReason &&
                !showRejectInput && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                      Rejection Reason
                    </p>
                    <p className="text-sm text-red-700">{selectedReq.rejectionReason}</p>
                  </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-7 pb-7">
              {selectedReq.status === "processing" || selectedReq.status === "rejected" ? (
                !showRejectInput ? (
                  <>
                    <button
                      onClick={() => handleApprove(selectedReq.id)}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-green-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex-1 py-3 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-sm font-bold rounded-xl transition-colors"
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectionError(false); }}
                      className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleReject}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-red-200"
                    >
                      Confirm Reject
                    </button>
                  </>
                )
              ) : (
                <button
                  onClick={closeModal}
                  className="py-3 px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsCancellationReq;