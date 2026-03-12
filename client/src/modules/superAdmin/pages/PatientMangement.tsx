import { useEffect, useState } from 'react';
import { Search, Edit2, Circle, AlertTriangle, CheckCircle, X, UserPlus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { superAdminApi } from '../../../constants/backend/superAdmin/superAdmin.api';
import { useNavigate } from 'react-router-dom';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';

export interface IPatient {
  _id: string;
  id?: string;
  name?: string;           // API returns 'name' not 'patientName'
  email?: string;
  phone?: number | string;
  gender?: string;         // API returns empty string, not strict union
  dateOfBirth?: string | Date | null;
  bloodGroup?: string;
  hospitalName?: string;
  hospitalId?: string;
  isActive?: boolean;
  image?: string;          // API returns 'image' not 'profilePicture'
  createdAt?: string | Date;
  updatedAt?: string | Date;
  lastVisit?: string | Date;
  isProfileComplete?: boolean;
  isGoogleAuth?: boolean;
  walletBalance?: number;
  appointmentHistory?: unknown[];
  medicalReports?: unknown[];
  fatherName?: string;
  address?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
}

const ITEMS_PER_PAGE = 5;

const PatientManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getPatientManagement({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: activeTab,
      });
      const responseData = response.data.data || [];
      const pagination = response.data.pagination || {};
      const pages = pagination.totalPages || 0;

      setPatients(responseData);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setPatients([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPatients(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const getDisplayStatus = (patient: IPatient): string => {
    if (!patient.isActive) return 'Inactive';
    if (!patient.isProfileComplete) return 'Pending';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const togglePatientStatus = (patient: IPatient) => {
    setConfirmTarget({
      id: patient._id,
      status: !!patient.isActive,
      name: patient.name || 'this patient',
    });
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      setIsToggling(true);
      const { id, status } = confirmTarget;

      const response = await superAdminApi.togglePatient({ id, isActive: !status });

      if (response.status === 200) {
        setPatients((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: !status } : p))
        );
        setShowConfirmModal(false);
        setConfirmTarget(null);
        toast.success('Patient status updated successfully');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update patient status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = (patient: IPatient) => {
    navigate(SUPERADMIN_ROUTES.EDITPATIENT, { state: { patient } });
  };

  const handleAddPatient = () => {
    navigate(SUPERADMIN_ROUTES.ADDPATIENT);
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

  const getGenderColor = (gender?: string) => {
    switch (gender) {
      case 'Male':
        return 'text-blue-600 bg-blue-50';
      case 'Female':
        return 'text-pink-600 bg-pink-50';
      default:
        return 'text-gray-600 bg-gray-100';
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
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600 mt-1">
                Manage registered patients, monitor status, and track hospital assignments.
              </p>
            </div>
            <button
              onClick={handleAddPatient}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add New Patient
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
                      className={`px-5 py-2 rounded-md font-medium transition-colors ${
                        activeTab === tab
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
                    placeholder="Search by patient name or ID..."
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
                <div className="p-12 text-center text-gray-500">Loading patients...</div>
              ) : patients.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No patients found matching your criteria
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Gender / Age
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Blood Group
                      </th>
                    
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Registered
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {patients.map((patient) => {
                      const status = getDisplayStatus(patient);

                      return (
                        <tr key={patient._id} className="hover:bg-gray-50">
                          {/* Patient Info */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                {patient.image ? (
                                  <img
                                    src={patient.image}
                                    alt={`${patient.name || 'Patient'} photo`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                    <User className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-[180px]">
                                  {patient.name || 'Unnamed Patient'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {patient._id?.toString().slice(-8) || '—'}
                                </div>
                                {patient.email && (
                                  <div className="text-xs text-gray-400 truncate max-w-[180px]">
                                    {patient.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}
                            >
                              <Circle className="w-2.5 h-2.5 fill-current" />
                              {status}
                            </span>
                          </td>

                          {/* Gender / Age */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {patient.gender ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${getGenderColor(patient.gender)}`}
                                >
                                  {patient.gender}
                                </span>
                              ) : null}
                              {patient.dateOfBirth ? (
                                <span className="text-sm text-gray-600">
                                  {Math.floor(
                                    (Date.now() - new Date(patient.dateOfBirth).getTime()) /
                                      (1000 * 60 * 60 * 24 * 365.25)
                                  )}{' '}
                                  yrs
                                </span>
                              ) : null}
                              {!patient.gender && !patient.dateOfBirth && (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </div>
                          </td>

                          {/* Blood Group */}
                          <td className="px-6 py-4">
                            {patient.bloodGroup ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                                {patient.bloodGroup}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>


                          {/* Registered */}
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(patient.createdAt)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => togglePatientStatus(patient)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  patient.isActive
                                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                }`}
                                title={patient.isActive ? 'Block Patient' : 'Activate Patient'}
                              >
                                <Circle
                                  className={`w-4 h-4 ${
                                    patient.isActive ? 'fill-red-600' : 'fill-green-600'
                                  }`}
                                />
                              </button>
                              <button
                                onClick={() => handleEdit(patient)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit Patient"
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
              )}
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
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    confirmTarget.status
                      ? 'bg-red-50 text-red-600'
                      : 'bg-green-50 text-green-600'
                  }`}
                >
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
                {confirmTarget.status ? 'Block Patient Account' : 'Activate Patient Account'}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                Are you sure you want to{' '}
                {confirmTarget.status ? 'deactivate' : 'activate'}{' '}
                <span className="font-bold text-slate-900">{confirmTarget.name}</span>?{' '}
                {confirmTarget.status
                  ? 'This will prevent them from accessing patient portal features until reactivated.'
                  : 'This will restore full access to their patient portal and appointment features.'}
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
                  className={`flex-1 h-12 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
                    confirmTarget.status
                      ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                      : 'bg-green-600 hover:bg-green-700 shadow-green-200'
                  }`}
                >
                  {isToggling ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : confirmTarget.status ? (
                    'Confirm Block'
                  ) : (
                    'Confirm Activation'
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

export default PatientManagement;