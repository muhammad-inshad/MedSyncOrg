import { useEffect, useState } from 'react';
import { Search, Edit2, Circle, AlertTriangle, CheckCircle, X, Plus, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { superAdminApi } from '../../../constants/backend/superAdmin/superAdmin.api';
import { useNavigate } from 'react-router-dom';
import { SUPERADMIN_ROUTES } from '@/constants/frontend/superAdmin/superAdmin.routes';
import type { ISubscription } from '@/interfaces/ISubscription';


const ITEMS_PER_PAGE = 5;

const SubscriptionManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ id: string; status: boolean; name: string } | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const navigate = useNavigate();

  const fetchSubscriptions = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getSubscriptionManagement({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: activeTab,
      });
      const responseData = response.data.data || [];
      console.log(responseData)
      const pagination = response.data.pagination || {};
      const pages = pagination.totalPages || 0;

      setSubscriptions(responseData);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      setSubscriptions([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchSubscriptions(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const getStatusColor = (isActive?: boolean) => {
    return isActive ? 'bg-emerald-500' : 'bg-gray-500';
  };

  const getPlanTypeColor = (planType?: string) => {
    switch (planType) {
      case 'Basic':
        return 'text-gray-600 bg-gray-100';
      case 'Standard':
        return 'text-blue-600 bg-blue-50';
      case 'Premium':
        return 'text-purple-600 bg-purple-50';
      case 'Enterprise':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleSubscriptionStatus = (subscription: ISubscription) => {
    setConfirmTarget({
      id: subscription._id,
      status: !!subscription.isActive,
      name: subscription.plan|| 'this plan',
    });
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    if (!confirmTarget) return;
    try {
      setIsToggling(true);
      const { id, status } = confirmTarget;

      const response = await superAdminApi.toggleSubscription({ id, isActive: !status });

      if (response.status === 200) {
        setSubscriptions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive: !status } : s))
        );
        setShowConfirmModal(false);
        setConfirmTarget(null);
        toast.success('Subscription status updated successfully');
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update subscription status');
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = (subscription: ISubscription) => {
    navigate(SUPERADMIN_ROUTES.EDITSUBSCRIPTION, { state: { subscription } });
  };

  const handleAddSubscription = () => {
    navigate(SUPERADMIN_ROUTES.ADDSUBSCRIPTION);
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

  const formatDuration = (duration?: number, unit?: string) => {
    if (!duration) return '—';
    return `${duration} ${unit || 'days'}`;
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-600 mt-1">
                Manage subscription plans, pricing, and monitor active subscribers.
              </p>
            </div>
            <button
              onClick={handleAddSubscription}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Plan
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
                    placeholder="Search by plan name or ID..."
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
                <div className="p-12 text-center text-gray-500">Loading subscriptions...</div>
              ) : subscriptions.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No subscription plans found matching your criteria
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Plan Type
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subscribers
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription._id} className="hover:bg-gray-50">
                        {/* Plan Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                              <CreditCard className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[180px]">
                                {subscription.plan || 'Unnamed Plan'}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {subscription._id?.toString().slice(-8) || '—'}
                              </div>
                         
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(subscription.isActive)}`}
                          >
                            <Circle className="w-2.5 h-2.5 fill-current" />
                            {subscription.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Plan Type */}
                        <td className="px-6 py-4">
                          {subscription.plan ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${getPlanTypeColor(subscription.plan)}`}
                            >
                              {subscription.plan}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-4">
                          {subscription.amount !== undefined ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                              {formatPrice(subscription.amount)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          {formatDuration(
  subscription.startDate && subscription.endDate
    ? Math.ceil(
        (new Date(subscription.endDate).getTime() -
          new Date(subscription.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : undefined,
  subscription.durationUnit
)}
                        </td>

                        {/* Subscribers */}
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          {subscription.subscriberCount !== undefined
                            ? subscription.subscriberCount.toLocaleString()
                            : '—'}
                        </td>

                        {/* Created */}
                        <td className="px-6 py-4 text-gray-700 text-sm">
                          {formatDate(subscription.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSubscriptionStatus(subscription)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                subscription.isActive
                                  ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                  : 'bg-green-100 hover:bg-green-200 text-green-700'
                              }`}
                              title={subscription.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                            >
                              <Circle
                                className={`w-4 h-4 ${
                                  subscription.isActive ? 'fill-red-600' : 'fill-green-600'
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(subscription)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit Plan"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                {confirmTarget.status ? 'Deactivate Subscription Plan' : 'Activate Subscription Plan'}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                Are you sure you want to{' '}
                {confirmTarget.status ? 'deactivate' : 'activate'}{' '}
                <span className="font-bold text-slate-900">{confirmTarget.name}</span>?{' '}
                {confirmTarget.status
                  ? 'This will prevent new subscribers from enrolling in this plan until reactivated.'
                  : 'This will make the plan visible and available for new subscriptions.'}
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
                    'Confirm Deactivate'
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

export default SubscriptionManagement;