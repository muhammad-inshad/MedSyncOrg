import { useEffect, useState, useCallback } from 'react';
import { Building2,ArrowRight, ShieldCheck, Clock, FileWarning, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import ManagementLayout from '../components/common/ManagementLayout';
import AvatarCell from '../components/common/AvatarCell';
import DataTable, { type Column } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';  

import { superAdminApi } from '../../../constants/backend/superAdmin/superAdmin.api';

const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

interface KYCApplication {
  _id?: string;
  id?: string;
  hospitalName: string;
  adminName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  address: string;
  licence?: string;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'revision';
  createdAt: string;
  rejectionReason?: string;
  reapplyDate?: string;
  logo: string;
  pin: string;
  pincode: string;
  about?: string;
  since: string;
}

const ITEMS_PER_PAGE = 5;

const KycManagement = () => {
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);

  const fetchApplications = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getKycManagement({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        filter: filter === 'all' ? undefined : filter
      });

      const responseData = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setApplications(responseData);
      setTotalPages(pagination.totalPages || 0);
      setTotalApplications(pagination.totalItems || 0);
      setCurrentPage(page);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch applications';
      toast.error(errorMessage);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => { fetchApplications(currentPage); }, [currentPage, fetchApplications]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchApplications(1);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, filter, fetchApplications, currentPage]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      if (!id) return toast.error("Application ID is missing");
      
      const res = await superAdminApi.updateKycStatus({ 
        id, 
        status, 
        reason: status === 'approved' ? undefined : rejectionReason 
      });

      if (res.status === 200) {
        toast.success(status === 'approved' ? 'Hospital Approved' : `Status updated to ${status}`);
        fetchApplications(currentPage);
        setShowModal(false);
        setSelectedApplication(null);
        setRejectionReason('');
      }
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : 'Action failed';
      toast.error(errorMessage); 
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Active',
      rejected: 'Expired',
      revision: 'Expiring Soon',
    };
    return labels[status] || status;
  };

  const columns: Column<KYCApplication>[] = [
    {
      key: 'hospital',
      header: 'Hospital Details',
      render: (app) => (
        <AvatarCell
          src={getImageUrl(app.logo)}
          name={app.hospitalName}
          id={String(app._id || app.id || '')}
          subText={app.reviewStatus === 'revision' ? '⚠️ Needs Revision' : undefined}
          fallbackIcon={<Building2 className="w-5 h-5 text-slate-400" />}
        />
      ),
    },
    {
      key: 'contact',
      header: 'Admin Contact',
      render: (app) => (
        <div className="min-w-[150px]">
          <div className="text-sm font-bold text-slate-900">{app.adminName || 'Admin'}</div>
          <div className="text-xs text-slate-500 truncate max-w-[180px]">{app.email}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (app) => <StatusBadge status={getStatusLabel(app.reviewStatus)} />,
    },
    {
      key: 'submitted',
      header: 'Submitted On',
      render: (app) => (
        <span className="text-sm text-slate-600 font-medium">
          {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (app) => (
        <button
          onClick={() => { setSelectedApplication(app); setShowModal(true); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all active:scale-95 border border-blue-100 shadow-sm"
        >
          Review
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  const pendingCount = applications.filter(a => a.reviewStatus === 'pending').length;
  const revisionCount = applications.filter(a => a.reviewStatus === 'revision').length;
  const rejectedCount = applications.filter(a => a.reviewStatus === 'rejected').length;

  return (
    <ManagementLayout
      title="KYC Management"
      subtitle="Review and verify hospital credentials, medical licenses, and registration details."
    >
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalApplications}</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">All Applications</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Pending</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingCount}</div>
          <div className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-wider">Awaiting Review</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
              <FileWarning className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">Revision</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{revisionCount}</div>
          <div className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-wider">Feedback Sent</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-50 rounded-xl text-red-500">
              <XCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-300">Rejected</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{rejectedCount}</div>
          <div className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">Permanently Denied</div>
        </div>
      </div>

      <DataTable
        data={applications}
        columns={columns}
        rowKey={(app) => String(app._id || app.id || Math.random())}
        isLoading={isLoading}
        tabs={['all', 'revision', 'pending', 'rejected']}
        activeTab={filter}
        onTabChange={(tab) => setFilter(tab as typeof filter)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by hospital name or admin email..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="No KYC applications found matching your criteria."
      />

      {/* Detailed Review Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 backdrop-blur-md bg-slate-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 transform transition-all scale-100">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex justify-between items-center z-10 font-bold">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight line-height-1">Application File</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Verification ID: {String(selectedApplication._id || selectedApplication.id).slice(-8)}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setRejectionReason('');
                  setShowZoomModal(false);
                }} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-8 space-y-10">
              {/* Profile & Info Grid */}
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner shrink-0 bg-slate-50 flex items-center justify-center">
                  {selectedApplication.logo ? (
                    <img src={getImageUrl(selectedApplication.logo)} alt="Hospital Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-12 h-12 text-slate-200" />
                  )}
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Hospital Entity</label>
                    <p className="text-slate-900 font-black text-xl">{selectedApplication.hospitalName}</p>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">ESTD {selectedApplication.since}</span>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Admin Presence</label>
                    <p className="text-slate-900 font-bold">{selectedApplication.adminName || 'Admin'}</p>
                    <p className="text-slate-500 text-sm font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Registration #</label>
                    <p className="text-slate-900 font-bold font-mono">{selectedApplication.registrationNumber || 'Pending'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Location Details</label>
                    <p className="text-slate-900 text-sm font-medium leading-relaxed">{selectedApplication.address} - {selectedApplication.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Documentary Evidence */}
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">DOC</span>
                  Medical License / Professional Credentials
                </h3>
                {selectedApplication.licence ? (
                  <div 
                    className="group relative cursor-zoom-in border-4 border-slate-50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all max-w-2xl bg-slate-50 mx-auto md:mx-0"
                    onClick={() => setShowZoomModal(true)}
                  >
                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                       <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-slate-900 shadow-xl border border-white">Click to Inspect Document</div>
                    </div>
                    <img
                      src={getImageUrl(selectedApplication.licence)}
                      alt="Medical License Evidence"
                      className="w-full h-[400px] object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Scan+Failed+to+Load'; }}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 font-bold italic tracking-wider">No documentary evidence provided</div>
                )}
              </div>

              {/* Status Action Deck */}
              {selectedApplication.reviewStatus !== 'approved' && (
                <div className="space-y-6 pt-10 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-[10px]">MOD</span>
                      Review Findings & Corrective Feedback
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={selectedApplication.rejectionReason || "Enter specific feedback or reasons for document rejection... This will be visible to the hospital admin."}
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 font-medium text-slate-700 min-h-[140px] transition-all placeholder:text-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleStatusUpdate(String(selectedApplication._id || selectedApplication.id), "approved")}
                      className="h-16 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95 flex items-center justify-center gap-2"
                    >
                      Approve Profile
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(String(selectedApplication._id || selectedApplication.id), 'revision')}
                      className="h-16 bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
                    >
                      Request Revision
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(String(selectedApplication._id || selectedApplication.id), 'rejected')}
                      className="h-16 bg-red-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                    >
                      Reject Entry
                    </button>
                  </div>
                </div>
              )}

              {selectedApplication.reviewStatus === 'approved' && (
                <div className="flex items-center justify-center gap-4 py-8 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div className="text-emerald-900 font-bold text-xl uppercase tracking-tight">Verified & Approved</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Resolution Document Viewer */}
      {showZoomModal && selectedApplication?.licence && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center z-[70] p-10 cursor-zoom-out animate-in zoom-in-105 duration-300" onClick={() => setShowZoomModal(false)}>
          <div className="absolute top-8 right-8 flex gap-4">
               <a 
                href={selectedApplication.licence} 
                download={`KYC_LICENSE_${selectedApplication.hospitalName}.jpg`}
                className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all shadow-2xl backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
               >
                   <svg className="w-6 h-6 outline-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               </a>
               <button className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all text-3xl font-light shadow-2xl backdrop-blur-sm">×</button>
          </div>
          <img src={getImageUrl(selectedApplication.licence)} alt="Evidence Inspection" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 shadow-2xl" />
        </div>
      )}
    </ManagementLayout>
  );
};

export default KycManagement;