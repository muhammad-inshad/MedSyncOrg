import { useEffect, useState, useCallback } from 'react';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ManagementLayout from '../components/common/ManagementLayout';
import AvatarCell from '../components/common/AvatarCell';
import DataTable, { type Column } from '../components/common/DataTable';
import RowActions from '../components/common/RowActions';
import StatusBadge from '../components/common/StatusBadge';  
import ConfirmationModal from '../components/common/ConfirmationModal';

import { superAdminApi } from '@/constants/backend/superAdmin/superAdmin.api';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import type { IPatient } from '@/interfaces/IPatient';

const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const ITEMS_PER_PAGE = 5;

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PatientManagement = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const res = await superAdminApi.getPatientManagement({ 
        page, 
        limit: ITEMS_PER_PAGE, 
        search: searchQuery,
        status: activeTab === 'All' ? undefined : activeTab.toLowerCase()
      });
      
      const responseBody = res.data;
      const rawList = Array.isArray(responseBody?.data) 
        ? responseBody.data 
        : Array.isArray(responseBody) 
          ? responseBody 
          : [];

      // Robust mapping for ID consistency
      const mappedList: IPatient[] = rawList.map((p: Record<string, unknown>) => ({
        ...p,
        _id: String(p._id || p.id || '')
      })) as IPatient[];

      const pagination = responseBody?.pagination || {};
      
      setPatients(mappedList);
      setTotalPages(pagination.totalPages || 0);
      setTotalPatients(pagination.totalItems || mappedList.length);
      setCurrentPage(page);
    } catch (error) {
      console.error('Fetch Patients Error:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => { fetchPatients(currentPage); }, [currentPage, fetchPatients]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPatients(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery, activeTab, fetchPatients, currentPage]);

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      setIsToggling(true);
      const res = await superAdminApi.togglePatient({ id: confirmTarget.id, isActive: !confirmTarget.status });
      if (res.status === 200) {
        setPatients((prev) => prev.map((p) => p.id === confirmTarget.id ? { ...p, isActive: !confirmTarget.status } : p));
        toast.success(`Patient ${!confirmTarget.status ? 'activated' : 'blocked'} successfully`);
        setConfirmTarget(null);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update patient status';
      toast.error(errorMessage);
    } finally {
      setIsToggling(false);
    }
  };

  const columns: Column<IPatient>[] = [
    {
      key: 'patient',
      header: 'Patient Details',
      render: (p) => (
        <AvatarCell
          src={getImageUrl(p.image)}
          name={p.name}
          id={p.id}
          subText={p.email}
          fallbackIcon={<span className="text-xl">👤</span>}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge status={p.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'details',
      header: 'Demographics',
      render: (p) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-700 uppercase">{p.gender || '—'}</span>
          <span className="text-[10px] font-black text-slate-400 tracking-tighter uppercase tabular-nums">
             {p.bloodGroup || 'Blood Type —'} 
          </span>
        </div>
      ),
    },
    {
      key: 'registered',
      header: 'Registered On',
      render: (p) => <span className="text-sm text-slate-600 font-medium">{formatDate(p.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (p) => {
        const patientId = p.id;
        return (
          <RowActions
            isActive={p.isActive}
            onToggle={() => setConfirmTarget({ id: patientId, status: p.isActive, name: p.name })}
            onEdit={() => navigate(SUPERADMIN_ROUTES.EDITPATIENT, { state: { patient: p } })}
          />
        );
      },
    },
  ];

  const activeCount = patients.filter(p => p.isActive).length;
  const inactiveCount = patients.filter(p => !p.isActive).length;

  return (
    <ManagementLayout
      title="Patient Management"
      subtitle="View, monitor, and manage the complete directory of registered patients."
      action={{
        label: 'Add New Patient',
        icon: <Users className="w-4 h-4 fill-current" />,
        onClick: () => navigate(SUPERADMIN_ROUTES.ADDPATIENT),
      }}
    >
      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalPatients}</div>
          <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">All Records</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{activeCount}</div>
          <div className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">Verified Users</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <UserX className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">Blocked</span>
          </div>
          <div className="text-2xl font-black text-slate-900">{inactiveCount}</div>
          <div className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-wider">Access Revoked</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Growth</span>
          </div>
          <div className="text-2xl font-black text-slate-900">Stable</div>
          <div className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-wider">Directory Status</div>
        </div>
      </div>

      <DataTable
        data={patients}
        columns={columns}
        rowKey={(p) => p.id || Math.random().toString()}
        isLoading={isLoading}
        tabs={['All', 'Active', 'Inactive']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient name, email, or ID..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="No patients found in the registry."
      />

      <ConfirmationModal
        isOpen={!!confirmTarget}
        isLoading={isToggling}
        title={confirmTarget?.status ? 'Restrict Patient Access' : 'Restore Patient Access'}
        description={`Are you sure you want to ${confirmTarget?.status ? 'block' : 'activate'} ${confirmTarget?.name}? This will immediately affect their ability to book appointments.`}
        confirmLabel={confirmTarget?.status ? 'Confirm Block' : 'Confirm Restoration'}
        confirmVariant={confirmTarget?.status ? 'danger' : 'success'}
        onConfirm={handleConfirmToggle}
        onClose={() => !isToggling && setConfirmTarget(null)}
      />
    </ManagementLayout>
  );
};

export default PatientManagement;
