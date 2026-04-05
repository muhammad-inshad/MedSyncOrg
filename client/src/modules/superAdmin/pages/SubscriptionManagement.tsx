import { useEffect, useState, useCallback } from 'react';
import { Plus, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ManagementLayout from '../components/common/ManagementLayout';
import AvatarCell from '../components/common/AvatarCell';
import DataTable, { type Column } from '../components/common/DataTable';
import RowActions from '../components/common/RowActions';
import StatusBadge from '../components/common/StatusBadge';  
import ConfirmationModal from '../components/common/ConfirmationModal';

import { superAdminApi } from '../../../constants/backend/superAdmin/superAdmin.api';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import AddSubscriptionModal from '../components/subscription/AddSubscriptionModal'; 

const ITEMS_PER_PAGE = 5;

interface ISubscription {
  id: string;
  amount: number;
  status: 'active' | 'inactive';
  planName: string;
  duration: number;
  durationUnit: 'days' | 'months' | 'years';
  description?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchSubscriptions = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getSubscriptionManagement({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: activeTab === 'All' ? undefined : activeTab.toLowerCase(),
      });
      
      const responseData: ISubscription[] = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setSubscriptions(responseData);
      setTotalPages(pagination.totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Failed to load subscriptions');
      setSubscriptions([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => { fetchSubscriptions(currentPage); }, [currentPage, fetchSubscriptions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchSubscriptions(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, fetchSubscriptions]);

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      setIsToggling(true);
      const response = await superAdminApi.toggleSubscription({ id: confirmTarget.id, isActive: !confirmTarget.status });
      if (response.status === 200) {
        setSubscriptions((prev) => prev.map((s) => s.id === confirmTarget.id ? { ...s, status: !confirmTarget.status ? 'active' : 'inactive' } : s));
        setConfirmTarget(null);
        toast.success('Subscription status updated');
      }
    } catch { toast.error('Failed to update subscription status'); }
    finally { setIsToggling(false); }
  };

  const formatDate = (d?: string | Date) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatPrice = (p?: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p || 0);
  };

  const columns: Column<ISubscription>[] = [
    {
      key: 'plan',
      header: 'Plan Name',
      render: (s) => (
        <AvatarCell
          name={s.planName}
          id={s.id}
          fallbackIcon={<CreditCard className="w-5 h-5 text-blue-500" />}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (s) => <StatusBadge status={s.status === 'active' ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'type',
      header: 'Plan Type',
      render: (s) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
          <Shield className="w-3 h-3" />
          {s.planName}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (s) => <span className="font-bold text-slate-900">{formatPrice(s.amount)}</span>,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (s) => <span className="text-sm text-slate-600 font-medium lowercase">{s.duration} {s.durationUnit}</span>,
    },
    {
      key: 'created',
      header: 'Created On',
      render: (s) => <span className="text-sm text-slate-500">{formatDate(s.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      width: 'w-32',
      render: (s) => (
        <RowActions
          isActive={s.status === 'active'}
          onToggle={() => setConfirmTarget({ id: s.id, status: s.status === 'active', name: s.planName })}
          onEdit={() => navigate(SUPERADMIN_ROUTES.EDITSUBSCRIPTION, { state: { subscription: s } })}
        />
      ),
    },
  ];

  return (
    <ManagementLayout
      title="Subscription Management"
      subtitle="Manage subscription plans, pricing, and monitor active subscribers."
      action={{
        label: 'Add New Plan',
        icon: <Plus className="w-4 h-4" />,
        onClick: () => setShowAddModal(true),
      }}
    >
      <DataTable
        data={subscriptions}
        columns={columns}
        rowKey={(s) => s.id}
        isLoading={isLoading}
        tabs={['All', 'Active', 'Inactive']}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as any)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by plan name or ID..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="No subscription plans found."
      />

      <ConfirmationModal
        isOpen={!!confirmTarget}
        isLoading={isToggling}
        title={confirmTarget?.status ? 'Deactivate Plan' : 'Activate Plan'}
        description={`Are you sure you want to ${confirmTarget?.status ? 'deactivate' : 'activate'} ${confirmTarget?.name ?? 'this plan'}?`}
        confirmLabel={confirmTarget?.status ? 'Confirm Deactivate' : 'Confirm Activate'}
        confirmVariant={confirmTarget?.status ? 'danger' : 'success'}
        onConfirm={handleConfirmToggle}
        onClose={() => !isToggling && setConfirmTarget(null)}
      />

      <AddSubscriptionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          fetchSubscriptions(1);
          setShowAddModal(false);
        }}
      />
    </ManagementLayout>
  );
};

export default SubscriptionManagement;