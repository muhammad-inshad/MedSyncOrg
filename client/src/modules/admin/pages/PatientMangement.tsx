import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Ban, User, Mail, Phone, ShieldCheck, ShieldAlert, Users, UserCheck, UserX, Clock } from 'lucide-react';
import api from '@/lib/api';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';
import { PATIENT_MANAGEMENT } from '../../../constants/backend/patient/patient.routes';
import { useNavigate } from 'react-router-dom';
import type { IPatient } from '@/interfaces/IPatient';
import { showToast } from '@/utils/toastUtils';
import ConfirmationModal from '@/components/ConfirmationModal';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 5;

const PatientMangement = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ id: string, name: string, status: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

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
}, [searchQuery]);

  const fetchPatients = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await api.get(PATIENT_MANAGEMENT.GETALLPATIENT, {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery
        }
      });
      const { data, totalPages } = response.data;
      setPatients(Array.isArray(data) ? data : []);
      setTotalPages(totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching Patients:", error);
      showToast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (patient: IPatient) => {
    navigate(ADMIN_ROUTES.ADMINPATIENTEDIT, { state: { patient } });
  };

  const handleToggleStatusClick = (id: string, name: string, status: boolean) => {
    setModalConfig({ id, name, status });
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!modalConfig) return;
    const { id, status } = modalConfig;

    try {
      const response = await api.patch(`/api/admin/PatientsToggle/${id}`);
      if (response.status === 200) {
        setPatients((prev) =>
          prev.map((p) => p._id === id ? { ...p, isActive: !p.isActive } : p)
        );
        showToast.success(`Patient ${status ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showToast.error('Operation failed. Please try again.');
    } finally {
      setIsModalOpen(false);
      setModalConfig(null);
    }
  };

  const handleAddPatient = () => {
    navigate(ADMIN_ROUTES.ADMINPATIENTADD);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patient Management</h1>
            <p className="text-slate-500 mt-1">Manage all registered patients and their access status.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
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
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all text-sm font-medium"
              />
            </div>

            <button
              onClick={handleAddPatient}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Patient
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Active Patients', value: patients.filter(p => p.isActive).length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Blocked Patients', value: patients.filter(p => !p.isActive).length, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            {
              label: 'Recently Added', value: patients.filter(p => {
                const date = new Date(p.createdAt);
                const now = new Date();
                return (now.getTime() - date.getTime()) < (24 * 60 * 60 * 1000);
              }).length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100/50'
            },
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

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400 font-medium">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No patients found</h3>
              <p className="text-slate-500">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((patient: IPatient) => (
                    <tr key={patient._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all">
                            {patient.image ? (
                              <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                <User className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{patient.name}</div>
                            <div className="text-xs font-medium text-slate-400 tracking-tighter uppercase">ID: {patient?._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {patient.email}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {patient.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${patient.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {patient.isActive ? (
                            <><ShieldCheck className="w-3 h-3" /> Active</>
                          ) : (
                            <><ShieldAlert className="w-3 h-3" /> Blocked</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {new Date(patient.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(patient)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit Patient"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatusClick(patient._id, patient.name, patient.isActive)}
                            className={`p-2 rounded-lg shadow-sm transition-all ${patient.isActive
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                              }`}
                            title={patient.isActive ? 'Block Patient' : 'Unblock Patient'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={modalConfig?.status ? 'Block Patient' : 'Activate Patient'}
        message={
          <div className="space-y-4">
            <p className="text-slate-600">Are you sure you want to {modalConfig?.status ? 'block' : 'unblock'} <span className="font-bold text-slate-900 uppercase">{modalConfig?.name}</span>?</p>
            <div className={`p-4 rounded-2xl border ${modalConfig?.status ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-xs font-bold leading-relaxed ${modalConfig?.status ? 'text-rose-700' : 'text-emerald-700'}`}>
                {modalConfig?.status
                  ? "This patient will lose access to their profile, medical records, and booking history until reactivation."
                  : "All platform features will be instantly restored for this patient."
                }
              </p>
            </div>
          </div>
        }
        confirmText={modalConfig?.status ? 'Block Patient' : 'Confirm Activation'}
        type={modalConfig?.status ? 'danger' : 'info'}
      />
    </div>
  );
};

export default PatientMangement;
