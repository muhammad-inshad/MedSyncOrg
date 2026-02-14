import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Ban, User, Mail, ShieldCheck, ShieldAlert, Stethoscope, GraduationCap, Users, UserCheck, UserX, Clock } from 'lucide-react';
import api from '@/lib/api';
import { ADMIN_ROUTES } from '@/constants/frontend/admin/admin.routes';
import { useNavigate } from 'react-router-dom';
import type { IDoctor } from '@/interfaces/IDoctor';
import { showToast } from '@/utils/toastUtils';
import ConfirmationModal from '@/components/ConfirmationModal';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 5;

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ id: string, name: string, status: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'Revision'>('all');
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();


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

  const fetchDoctors = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/admin/getalldoctors", {
        params: {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
          filter: filter
        }
      });
      const { data, totalPages } = response.data;
      setDoctors(Array.isArray(data) ? data : []);
      setTotalPages(totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      showToast.error("Failed to fetch doctors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (doctor: IDoctor) => {
    navigate(ADMIN_ROUTES.ADMINDOCTOREDIT, { state: { doctor } });
  };

  const handleToggleStatusClick = (id: string, name: string, status: boolean) => {
    setModalConfig({ id, name, status });
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!modalConfig) return;
    const { id, status } = modalConfig;

    try {
      const response = await api.patch(`/api/admin/doctorsToggle/${id}`);
      if (response.status === 200) {
        setDoctors((prev) =>
          prev.map((d) => d._id === id ? { ...d, isActive: !d.isActive } : d)
        );
        showToast.success(`Doctor ${status ? 'suspended' : 'unsuspended'} successfully`);
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      showToast.error('Operation failed');
    } finally {
      setIsModalOpen(false);
      setModalConfig(null);
    }
  };

  const getStatusBadge = (status?: string, isActive?: boolean) => {
    if (!isActive) return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-rose-50 text-rose-700 border-rose-100">
        <ShieldAlert className="w-3 h-3" /> Suspended
      </span>
    );

    const colors = {
      approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      pending: 'bg-blue-50 text-blue-700 border-blue-100',
      rejected: 'bg-slate-50 text-slate-700 border-slate-100',
      Revision: 'bg-amber-50 text-amber-700 border-amber-100',
    };

    const labels = {
      approved: 'Verified',
      pending: 'Pending',
      rejected: 'Rejected',
      Revision: 'Needs Revision',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status === 'approved' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 font-inter">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Doctor Directory</h1>
            <p className="text-slate-500 mt-1">Manage hospital medical staff, departments, and active status.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, dept, email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 shadow-sm transition-all text-sm font-medium"
              />
            </div>

            <button
              onClick={() => navigate(ADMIN_ROUTES.ADMINDOCTORADD)}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New Doctor
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Doctors', value: doctors.length, icon: Users, color: 'text-slate-600', bg: 'bg-slate-100' },
            { label: 'Active Doctors', value: doctors.filter(d => d.isActive).length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100/50' },
            { label: 'Suspended', value: doctors.filter(d => !d.isActive).length, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-100/50' },
            { label: 'Pending Review', value: doctors.filter(d => d.reviewStatus === 'pending').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100/50' },
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-10 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
            {(['all', 'Revision', 'pending', 'rejected', 'approved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/30'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {tab === 'all' ? 'All Staff' : tab === 'Revision' ? 'Needs Revision' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400 font-medium">Loading doctors...</p>
            </div>
          ) : doctors.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No doctors found</h3>
              <p className="text-slate-500">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Doctor Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Department & Exp</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qualification</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctors.map((doctor: IDoctor) => (
                    <tr key={doctor._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-slate-100 group-hover:ring-blue-100 transition-all">
                            {doctor.profileImage ? (
                              <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                                <User className="w-6 h-6 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">Dr. {doctor.name}</div>
                            <div className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1 tracking-tight">
                              <Mail className="w-3 h-3" /> {doctor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                            {doctor.department}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 pl-5 uppercase tabular-nums">
                            {doctor.experience} Years Experience
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(doctor.reviewStatus, doctor.isActive)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase">
                          <GraduationCap className="w-4 h-4 text-slate-400" />
                          {doctor.qualification}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatusClick(doctor._id, doctor.name, doctor.isActive)}
                            className={`p-2 rounded-lg shadow-sm transition-all ${doctor.isActive
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                              }`}
                            title={doctor.isActive ? 'Suspend Doctor' : 'Activate Doctor'}
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

          {/* Pagination */}
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
        title={modalConfig?.status ? 'Suspend Application' : 'Activate Doctor'}
        message={
          <div className="space-y-4">
            <p className="text-slate-600">Are you sure you want to {modalConfig?.status ? 'suspend' : 'unsuspended'} <span className="font-bold text-slate-900 uppercase">Dr. {modalConfig?.name}</span>?</p>
            <div className={`p-4 rounded-2xl border ${modalConfig?.status ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <p className={`text-xs font-bold leading-relaxed ${modalConfig?.status ? 'text-amber-700' : 'text-emerald-700'}`}>
                {modalConfig?.status
                  ? "Suspending this doctor will instantly revoke their access to the platform. They won't be able to manage appointments or consult patients until unsuspended."
                  : "All platform features will be instantly restored for this doctor."
                }
              </p>
            </div>
          </div>
        }
        confirmText={modalConfig?.status ? 'Yes, Suspend' : 'Confirm Activation'}
        type={modalConfig?.status ? 'warning' : 'info'}
      />
    </div>
  );
};

export default DoctorManagement;
