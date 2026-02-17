import { useState, useEffect } from 'react';
import { Search, Building2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import SuperAdminSidebar from '../components/SuperAdminsidebar';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

interface KYCApplication {
  _id: string;
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
  since: string
}

const ITEMS_PER_PAGE = 5;

const KycManagement = () => {
  const [applications, setApplications] = useState<KYCApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<KYCApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'rejected' | 'revision'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchApplications = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/superadmin/hospitals', {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
          filter: filter
        }
      });
      const { data, totalPages } = response.data;
      setApplications(Array.isArray(data) ? data : []);
      setTotalPages(totalPages || 0);
      setCurrentPage(page);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch applications';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchApplications(1);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, filter]);


  const handlestatus = async (id: string, status: string) => {
    try {
      const payload = status !== 'approved' && rejectionReason.trim().length > 0
        ? { rejectionReason }
        : {};

      await api.patch(`/api/superadmin/hospitalStatus/${id}/${status}`, payload);

      const successMsg = status === 'approved' ? 'Hospital Approved' : `Status updated to ${status}`;
      toast.success(successMsg);

      fetchApplications(currentPage);
      setShowModal(false);
      setSelectedApplication(null);
      setRejectionReason('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Action failed';
      toast.error(message);
    }
  };


  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-101 text-yellow-800',
      rejected: 'bg-red-101 text-red-800',
      revision: 'bg-orange-101 text-orange-800',
    };

    const labels = {
      pending: 'Pending Review',
      rejected: 'Rejected',
      revision: 'Needs Revision',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
          }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-901 mb-2">KYC Management</h1>
              <p className="text-gray-600">Review and manage hospital registration applications</p>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="Search hospitals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-64"
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Applications</div>
              <div className="text-2xl font-bold text-gray-901">{applications.length}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Pending Review</div>
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter((app) => app.reviewStatus === 'pending').length}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Needs Revision</div>
              <div className="text-2xl font-bold text-orange-600">
                {applications.filter((app) => app.reviewStatus === 'revision').length}
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex border-b border-gray-200">
              {(['all', 'revision', 'pending', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${filter === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-901'
                    }`}
                >
                  {tab === 'all' ? 'All Applications' : tab === 'revision' ? 'Needs Revision' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                      {applications.filter((app) => app.reviewStatus === tab).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No applications found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hospital Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app: KYCApplication) => (
                      <tr
                        key={app._id}
                        className={`hover:bg-gray-50 transition-colors ${app.reviewStatus === 'revision' ? 'bg-orange-50' : ''
                          }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {app.reviewStatus === 'revision' && <span className="mr-2 text-orange-500">⚠️</span>}
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 mr-3 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                              {app.logo ? (
                                <img
                                  src={app.logo}
                                  alt={app.hospitalName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=H';
                                  }}
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-901">{app.hospitalName}</div>
                              <div className="text-sm text-gray-500">ID: {app._id.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-901">{'Admin'}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(app.reviewStatus)}
                          {app.reviewStatus === 'revision' && app.rejectionReason && (
                            <div className="mt-1 text-xs text-orange-600 line-clamp-1">{app.rejectionReason}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>

        {/* Review Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 backdrop-blur-md bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-2xl font-bold text-gray-901">Application Review</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectionReason('');
                    setShowZoomModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-8">
                <div><div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
                  <img
                    src={selectedApplication.logo}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>

                  <h3 className="text-xl font-semibold text-gray-901 mb-4">Hospital Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Hospital Name</label>
                      <p className="text-gray-901 font-medium">{selectedApplication.hospitalName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
                      <p className="text-gray-901 font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Phone</label>
                      <p className="text-gray-901 font-medium">{selectedApplication.phone}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-600 block mb-1">Address</label>
                      <p className="text-gray-901">{selectedApplication.address}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-600 block mb-1">About</label>
                      <p className="text-gray-901">{selectedApplication.about || 'No description provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Since (Year)</label>
                      <p className="text-gray-901">{selectedApplication.since}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 block mb-1">Pincode</label>
                      <p className="text-gray-901">{selectedApplication.pincode}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-901 mb-4">Medical License / Documents</h3>
                  {selectedApplication.licence ? (
                    <div className="space-y-4">
                      <div
                        className="cursor-pointer border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all max-w-xs mx-auto"
                        onClick={() => setShowZoomModal(true)}
                      >
                        <img
                          src={selectedApplication.licence}
                          alt="Medical License Document Preview"
                          className="w-full h-64 object-contain bg-gray-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-failed.jpg';
                            (e.target as HTMLImageElement).alt = 'Failed to load preview';
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 italic">
                      No license document uploaded
                    </div>
                  )}
                </div>

                {/* Rejection/Revision reason + buttons */}
                {selectedApplication.reviewStatus !== 'approved' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Revision or Rejection
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={selectedApplication.rejectionReason ? selectedApplication.rejectionReason : "Provide detailed feedback..."}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[140px] resize-y"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handlestatus(selectedApplication._id, "approved")}
                        className="flex-1 bg-green-600 text-white px-6 py-3.5 rounded-lg hover:bg-green-700 font-medium transition-colors shadow-sm"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handlestatus(selectedApplication._id, 'revision')}
                        className="flex-1 bg-orange-600 text-white px-6 py-3.5 rounded-lg hover:bg-orange-700 font-medium transition-colors shadow-sm"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => handlestatus(selectedApplication._id, 'rejected')}
                        className="flex-1 bg-red-600 text-white px-6 py-3.5 rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                      >
                        Reject Permanently
                      </button>
                    </div>
                  </>
                )}

                {selectedApplication.reviewStatus === 'approved' && (
                  <div className="text-center py-10 text-green-700 font-medium text-lg bg-green-50 rounded-lg">
                    ✓ This application has already been approved.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Zoom / Full-size Image Modal ── */}
        {showZoomModal && selectedApplication?.licence && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowZoomModal(false)}
          >
            <div className="relative max-w-5xl w-full max-h-[95vh] flex flex-col items-center">
              {/* Close button */}
              <button
                onClick={() => setShowZoomModal(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-3 text-2xl leading-none z-10"
              >
                ×
              </button>

              {/* Image */}
              <img
                src={selectedApplication.licence}
                alt="Medical License - Full View"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
              />

              {/* Download button */}
              <a
                href={selectedApplication.licence}
                download={`hospital-licence-${selectedApplication.hospitalName || 'document'}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Full Image
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycManagement;