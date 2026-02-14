import { useEffect, useState } from 'react';
import { Search, Edit2, Circle, AlertTriangle, CheckCircle, X } from 'lucide-react';
import Pagination from '@/components/Pagination';
import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import api from '../../../lib/api';
import { useNavigate } from "react-router-dom";
import type { IAdmin } from '@/interfaces/IAdmin';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';

const ITEMS_PER_PAGE = 8;

const HospitalManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<IAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchHospitals = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/superadmin/hospitalManagement', {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery
        }
      });
      const { data, totalPages } = response.data;
      setHospitals(data || []);
      setTotalPages(totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchHospitals(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  const getDisplayStatus = (hospital: IAdmin): string => {
    if (!hospital.isActive) return 'Inactive';
    if (hospital.subscription?.status === 'expired') return 'Inactive';
    if (hospital.subscription?.status === 'cancelled') return 'Inactive';
    if (hospital.subscription?.status === 'active') return 'Active';
    return 'Pending';
  };

  const toggleToActive = (hospital: IAdmin) => {
    setConfirmTarget({
      id: hospital._id,
      status: !!hospital.isActive,
      name: hospital.hospitalName || 'this hospital'
    });
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;

    try {
      setIsToggling(true);
      const { id, status } = confirmTarget;
      const response = await api.patch('/api/superadmin/setActive', {
        id,
        isActive: !status
      });

      if (response.status === 200) {
        setHospitals((prevHospitals) =>
          prevHospitals.map((hospital) =>
            hospital._id === id ? { ...hospital, isActive: !status } : hospital
          )
        );
        setShowConfirmModal(false);
        setConfirmTarget(null);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      alert('Failed to update hospital status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = (hospital: IAdmin) => {
    navigate(SUPERADMIN_ROUTES.EDITHOSPITAL, {
      state: { hospital }
    });
  };

  const hadileAddhospital = () => {
    navigate(SUPERADMIN_ROUTES.ADDHOSPITAL)
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      case 'Inactive':
        return 'bg-gray-400';
      case 'Pending':
        return 'bg-amber-600';
      default:
        return 'bg-gray-500';
    }
  };


  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-901">Hospital Management</h1>
              <p className="text-gray-600 mt-1">
                Manage registered hospitals, monitor status, and track subscriptions.
              </p>
            </div>

            <button onClick={hadileAddhospital} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Circle className="w-4 h-4 fill-current" />
              Add New Hospital
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs + Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  {['All', 'Active', 'Inactive'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-2 rounded-md font-medium transition-colors ${activeTab === tab
                        ? 'bg-slate-700 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by hospital name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading hospitals...</div>
              ) : hospitals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No hospitals found matching your criteria
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Hospital
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sub. Start
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sub. End
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hospitals.map((hospital) => {
                      const status = getDisplayStatus(hospital);

                      return (
                        <tr key={hospital._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {/* Hospital Logo from Cloudinary */}
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                {hospital.logo ? (
                                  <img
                                    src={hospital.logo}
                                    alt={`${hospital.hospitalName || 'Hospital'} logo`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://via.placeholder.com/48/cccccc/666666?text=🏥';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl bg-linear-to-br from-blue-50 to-blue-100">
                                    🏥
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="font-medium text-gray-901 truncate max-w-55">
                                  {hospital.hospitalName || 'Unnamed Hospital'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {hospital._id?.toString().slice(-8) || '—'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(
                                status
                              )}`}
                            >
                              <Circle className="w-2.5 h-2.5 fill-current" />
                              {status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.createdAt)}
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.subscription?.startDate)}
                          </td>

                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(hospital.subscription?.endDate)}
                          </td>

                          <td className="px-6 py-4 font-medium text-gray-901">
                            {hospital.subscription?.amount
                              ? `₹${hospital.subscription.amount}`
                              : '—'}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleToActive(hospital)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hospital.isActive
                                  ? "bg-red-100 hover:bg-red-200 text-red-700"
                                  : "bg-green-100 hover:bg-green-200 text-green-700"
                                  }`}
                                title={hospital.isActive ? "Block Hospital" : "Activate Hospital"}
                              >
                                <Circle className={`w-4 h-4 ${hospital.isActive ? "fill-red-600" : "fill-green-600"}`} />
                              </button>

                              <button onClick={() => handleEdit(hospital)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit Hospital"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
              }
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isToggling && setShowConfirmModal(false)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${confirmTarget.status ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                  }`}>
                  {confirmTarget.status ? (
                    <AlertTriangle className="w-7 h-7" />
                  ) : (
                    <CheckCircle className="w-7 h-7" />
                  )}
                </div>
                <button
                  disabled={isToggling}
                  onClick={() => setShowConfirmModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {confirmTarget.status ? 'Block Hospital Account' : 'Activate Hospital Account'}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                Are you sure you want to {confirmTarget.status ? 'deactivate' : 'activate'} <span className="font-bold text-slate-900">{confirmTarget.name}</span>?
                {confirmTarget.status
                  ? ' This will prevent them from accessing the management dashboard until reactivated.'
                  : ' This will grant them full access to their hospital management features.'}
              </p>

              <div className="flex gap-4">
                <button
                  disabled={isToggling}
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isToggling}
                  onClick={handleConfirmToggle}
                  className={`flex-1 h-12 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${confirmTarget.status
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                    : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                    }`}
                >
                  {isToggling ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmTarget.status ? 'Confirm Block' : 'Confirm Activation'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalManagement;