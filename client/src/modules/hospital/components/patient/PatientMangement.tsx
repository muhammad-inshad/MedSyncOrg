import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Ban, User, Mail, Phone, ShieldCheck, ShieldAlert, Users, UserCheck, UserX, Clock, icons } from 'lucide-react';
import { hospitalApi } from '@/constants/backend/hospital/hospital.api';
import { HOSPITAL_ROUTES } from '@/constants/frontend/hospital/hospital.routes';
import { useNavigate } from 'react-router-dom';
import type { IPatient } from '@/interfaces/IPatient';
import { showToast } from '@/utils/toastUtils';
import ConfirmationModal from '@/components/ConfirmationModal';
import Pagination from '@/components/Pagination';
import { StatsCards } from "../tables/StatsCards";
import { FilterTabs } from "../tables/FilterTabs";
import { DataTable, type TableColumn } from "../tables/DataTable";

const ITEMS_PER_PAGE = 5;

type FilterType = 'all' | 'active' | 'blocked';

const PatientManagement = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ id: string; name: string; isActive: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  // Fetch patients when page or filter changes
  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage, filter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPatients = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await hospitalApi.getAllPatients({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        filter: filter === 'all' ? undefined : filter,   // Send 'active' or 'blocked'
      });

      const { data, pagination } = response.data;
      setPatients(Array.isArray(data) ? data : []);
      setTotalPages(pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showToast.error("Failed to load patients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (patient: IPatient) => {
    navigate(HOSPITAL_ROUTES.HOSPITALPATIENTEDIT, { state: { patient } });
  };

  const handleToggleStatusClick = (id: string, name: string, isActive: boolean) => {
    setModalConfig({ id, name, isActive });
    setIsModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!modalConfig) return;
    const { id, isActive } = modalConfig;
    const newStatus = !isActive;

    try {
      const response = await hospitalApi.togglePatient(id, { status: newStatus.toString() });

      if (response.status === 200) {
        setPatients((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: newStatus } : p))
        );

        showToast.success(`Patient ${newStatus ? 'activated' : 'blocked'} successfully`);

        // Refresh if on filtered view
        if (filter !== 'all') {
          fetchPatients(currentPage);
        }
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
    navigate(HOSPITAL_ROUTES.HOSPITALPATIENTADD);
  };

  // Filter Tabs
  const filterTabs = [
    { key: 'all' as const, label: 'All Patients' },
    { key: 'active' as const, label: 'Active' },
    { key: 'blocked' as const, label: 'Blocked' },
  ];

  const stats=[
    {
      label:"Total Patients",
      value:patients.length,
      icon:Users,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      label:"Active Patients",
      value:patients.filter(p => p.isActive).length,
      icon:UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100/50",
    },
    {
      label:"Blocked Patients",
      value:patients.filter(p => !p.isActive).length,
      icon:UserX,
      color: "text-rose-600",
      bg: "bg-rose-100/50",
    }
  ];
const getFilterCount = (key: string) => {
  switch (key) {
    case "active":
      return patients.filter((p) => p.isActive).length;
    case "blocked":
      return patients.filter((p) => !p.isActive).length;
    default:
      return 0;
  }
};

const tableColumns: TableColumn[] = [
  { key: "details", label: "Patient Details" },
  { key: "contact", label: "Contact Info" },
  { key: "status", label: "Status" },
  { key: "joined", label: "Joined Date" },
  { key: "actions", label: "Actions", className: "text-right" },
];
const renderPatientRow = (patient: IPatient) => (
  <>
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
          <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600">{patient.name}</div>
          <div className="text-xs font-medium text-slate-400 tracking-tighter">ID: {patient?.id?.slice(-8)}</div>
        </div>
      </div>
    </td>

    <td className="px-6 py-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          {patient.email}
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {patient.phone}
        </div>
      </div>
    </td>

    <td className="px-6 py-4">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
          patient.isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
            : "bg-rose-50 text-rose-700 border-rose-100"
        }`}
      >
        {patient.isActive ? (
          <>
            <ShieldCheck className="w-3 h-3" /> Active
          </>
        ) : (
          <>
            <ShieldAlert className="w-3 h-3" /> Blocked
          </>
        )}
      </span>
    </td>

    <td className="px-6 py-4 text-xs font-medium text-slate-500">
      {new Date(patient.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
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
          onClick={() => handleToggleStatusClick(patient.id, patient.name, patient.isActive)}
          className={`p-2 rounded-lg shadow-sm transition-all ${
            patient.isActive
              ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          }`}
          title={patient.isActive ? "Block Patient" : "Unblock Patient"}
        >
          <Ban className="w-4 h-4" />
        </button>
      </div>
    </td>
  </>
);

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
                onChange={(e) => setSearchQuery(e.target.value)}
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

          <StatsCards stats={stats} />      
 
         <FilterTabs
         tabs={filterTabs}
         activeFilter={filter}
         onFilterChange={(filterkey)=>{
          setFilter(filterkey as FilterType);
          setCurrentPage(1)
         }} getCount={getFilterCount}/>

        {/* Table Section */}
       {/* Table Section */}
<div className="mb-8">
  <DataTable
    data={patients}
    columns={tableColumns}
    renderRow={renderPatientRow}
    isLoading={isLoading}
    emptyState={{
      title: "No patients found",
      message: "Try adjusting your search or filter.",
      icon: <Search className="w-8 h-8 text-slate-300" />,
    }}
  />

  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
  />
</div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalConfig(null);
        }}
        onConfirm={handleConfirmToggle}
        title={modalConfig?.isActive ? 'Block Patient' : 'Unblock Patient'}
        message={
          <div className="space-y-4">
            <p className="text-slate-600">
              Are you sure you want to {modalConfig?.isActive ? 'block' : 'unblock'}{' '}
              <span className="font-bold text-slate-900">{modalConfig?.name}</span>?
            </p>
            <div className={`p-4 rounded-2xl border ${
              modalConfig?.isActive ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <p className={`text-xs font-medium leading-relaxed ${
                modalConfig?.isActive ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {modalConfig?.isActive
                  ? "This patient will lose access to their profile, medical records, and booking history until reactivation."
                  : "All platform features will be instantly restored for this patient."
                }
              </p>
            </div>
          </div>
        }
        confirmText={modalConfig?.isActive ? 'Yes, Block Patient' : 'Yes, Unblock Patient'}
        type={modalConfig?.isActive ? 'danger' : 'info'}
      />
    </div>
  );
};

export default PatientManagement;