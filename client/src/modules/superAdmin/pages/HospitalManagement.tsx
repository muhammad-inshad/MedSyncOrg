import { useEffect, useState } from 'react';
import { Circle } from 'lucide-react';
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
import type { IHospital } from '@/interfaces/IHospital';

const ITEMS_PER_PAGE = 5;

const formatDate = (d?: string | Date) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getDisplayStatus = (h: IHospital) => {
  if (!h.isActive) return 'Inactive';
  if (h.subscription?.status === 'active') return 'Active';
  if (['expired', 'cancelled'].includes(h.subscription?.status ?? '')) return 'Inactive';
  return 'Pending';
};

const HospitalManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<IHospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchHospitals = async (page: number) => {
    try {
      setIsLoading(true);
      const res = await superAdminApi.getHospitalManagement({ page, limit: ITEMS_PER_PAGE, search: searchQuery, status: activeTab });
      setHospitals(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 0);
      setCurrentPage(page);
    } catch { setHospitals([]); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchHospitals(currentPage); }, [currentPage]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchHospitals(1);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery, activeTab]);

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      setIsToggling(true);
      const res = await superAdminApi.setHospitalActive({ id: confirmTarget.id, isActive: !confirmTarget.status });
      if (res.status === 200) {
        setHospitals((prev) => prev.map((h) => (h._id === confirmTarget.id || h.id === confirmTarget.id) ? { ...h, isActive: !confirmTarget.status } : h));
        setConfirmTarget(null);
        toast.success('Hospital status updated');
      }
    } catch { toast.error('Failed to update hospital status'); }
    finally { setIsToggling(false); }
  };

  //  Column definitions — all the custom UI lives here
  const columns: Column<IHospital>[] = [
    {
      key: 'hospital',
      header: 'Hospital',
      render: (h) => (
        <AvatarCell
          src={h.logo}
          name={h.hospitalName || 'Unnamed Hospital'}
          id={h._id || h.id || ''}
          fallbackIcon={<span className="text-2xl">🏥</span>}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (h) => <StatusBadge status={getDisplayStatus(h)} />,
    },
    {
      key: 'registered',
      header: 'Registered',
      render: (h) => <span className="text-sm text-gray-700">{formatDate(h.createdAt)}</span>,
    },
    {
      key: 'subStart',
      header: 'Sub. Start',
      render: (h) => <span className="text-sm text-gray-700">{formatDate(h.subscription?.startDate)}</span>,
    },
    {
      key: 'subEnd',
      header: 'Sub. End',
      render: (h) => <span className="text-sm text-gray-700">{formatDate(h.subscription?.endDate)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (h) => <span className="font-medium">{h.subscription?.amount ? `₹${h.subscription.amount}` : '—'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (h) => {
        const hospitalId = h._id || h.id || '';
        return (
          <RowActions
            isActive={!!h.isActive}
            onToggle={() => setConfirmTarget({ id: hospitalId, status: !!h.isActive, name: h.hospitalName || 'this hospital' })}
            onEdit={() => navigate(SUPERADMIN_ROUTES.EDITHOSPITAL, { state: { hospital: h } })}
          />
        );
      },
    },
  ];

  return (
    <ManagementLayout
      title="Hospital Management"
      subtitle="Manage registered hospitals, monitor status, and track subscriptions."
      action={{
        label: 'Add New Hospital',
        icon: <Circle className="w-4 h-4 fill-current" />,
        onClick: () => navigate(SUPERADMIN_ROUTES.ADDHOSPITAL),
      }}
    >
      <DataTable
        data={hospitals}
        columns={columns}
        rowKey={(h) => h._id || h.id || Math.random().toString()}
        isLoading={isLoading}
        tabs={['All', 'Active', 'Inactive']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by hospital name or ID..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="No hospitals found matching your criteria."
      />

      <ConfirmationModal
        isOpen={!!confirmTarget}
        isLoading={isToggling}
        title={confirmTarget?.status ? 'Block Hospital Account' : 'Activate Hospital Account'}
        description={`Are you sure you want to ${confirmTarget?.status ? 'deactivate' : 'activate'} ${confirmTarget?.name ?? 'this item'}?`}
        confirmLabel={confirmTarget?.status ? 'Confirm Block' : 'Confirm Activation'}
        confirmVariant={confirmTarget?.status ? 'danger' : 'success'}
        onConfirm={handleConfirmToggle}
        onClose={() => !isToggling && setConfirmTarget(null)}
      />
    </ManagementLayout>
  );
};

export default HospitalManagement;