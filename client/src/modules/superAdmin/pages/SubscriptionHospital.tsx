import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Building2,
  Circle,
  AlertTriangle,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import SuperAdminSidebar from '@/modules/superAdmin/components/SuperAdminsidebar';
import { superAdminApi } from '../../../constants/backend/superAdmin/superAdmin.api';

const ITEMS_PER_PAGE = 5;

// ─── Types ───────────────────────────────────────────────────────────────────

interface IHospitalSubscription {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalEmail: string;
  hospitalPhone: string;
  hospitalAddress: string;
  contactPerson: string;
  planName: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  createdAt: string;
  durationUnit: 'days' | 'months' | 'years';
  duration: number;
  logoUrl?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (dateString?: string) => {
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

const formatPrice = (price?: number) => {
  if (price === undefined || price === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const getDaysRemaining = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getStatusConfig = (status: string, endDate: string) => {
  if (status === 'expired' || getDaysRemaining(endDate) <= 0) {
    return {
      label: 'Expired',
      dotColor: 'bg-red-500',
      badgeClass: 'bg-red-100 text-red-700 border border-red-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    };
  }
  if (status === 'cancelled') {
    return {
      label: 'Cancelled',
      dotColor: 'bg-gray-400',
      badgeClass: 'bg-gray-100 text-gray-600 border border-gray-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    };
  }
  const days = getDaysRemaining(endDate);
  if (days <= 7) {
    return {
      label: 'Expiring Soon',
      dotColor: 'bg-amber-400',
      badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    };
  }
  return {
    label: 'Active',
    dotColor: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  };
};

const getPlanTypeColor = (planName: string) => {
  const colors: Record<string, string> = {
    Basic: 'bg-blue-100 text-blue-800',
    Standard: 'bg-green-100 text-green-800',
    Premium: 'bg-purple-100 text-purple-800',
    Enterprise: 'bg-orange-100 text-orange-800',
    free: 'bg-gray-100 text-gray-800',
  };
  return colors[planName] || 'bg-gray-100 text-gray-800';
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  hospital: IHospitalSubscription;
  onClose: () => void;
}

const DetailModal = ({ hospital, onClose }: DetailModalProps) => {
  const statusCfg = getStatusConfig(hospital.status, hospital.endDate);
  const daysLeft = getDaysRemaining(hospital.endDate);
  const isExpired = daysLeft <= 0 || hospital.status === 'expired';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-900/20 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

        {/* Top accent strip */}
        <div className={`h-1.5 w-full ${isExpired ? 'bg-red-400' : daysLeft <= 7 ? 'bg-amber-400' : 'bg-emerald-500'}`} />

        {/* Header */}
        <div className="p-7 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shadow-sm">
                {hospital.logoUrl
                  ? <img src={hospital.logoUrl} alt="" className="w-10 h-10 object-contain rounded-xl" />
                  : <Building2 className="w-7 h-7 text-slate-500" />
                }
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{hospital.hospitalName}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${statusCfg.badgeClass}`}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-7 space-y-6">

          {/* Subscription expiry banner */}
          {isExpired && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-700 text-sm">Subscription Expired</p>
                <p className="text-red-600 text-xs mt-0.5">
                  This hospital's subscription ended on {formatDate(hospital.endDate)}.
                </p>
              </div>
            </div>
          )}

          {daysLeft > 0 && daysLeft <= 7 && !isExpired && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-700 text-sm">Expiring in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                <p className="text-amber-600 text-xs mt-0.5">Renewal recommended before {formatDate(hospital.endDate)}.</p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact Information</p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <span>{hospital.contactPerson || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <span className="truncate">{hospital.hospitalEmail || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <span>{hospital.hospitalPhone || '—'}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                </div>
                <span className="leading-relaxed">{hospital.hospitalAddress || '—'}</span>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Subscription Details</p>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Plan
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${getPlanTypeColor(hospital.planName)}`}>
                  {hospital.planName}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Amount</span>
                <span className="text-sm font-bold text-green-700">{formatPrice(hospital.amount)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Start Date
                </span>
                <span className="text-sm text-slate-700">{formatDate(hospital.startDate)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> End Date
                </span>
                <span className={`text-sm font-semibold ${isExpired ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-slate-700'}`}>
                  {formatDate(hospital.endDate)}
                </span>
              </div>
              {!isExpired && daysLeft > 0 && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Days Remaining
                  </span>
                  <span className={`text-sm font-bold ${daysLeft <= 7 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 pb-7">
          <button
            onClick={onClose}
            className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const SubscriptionHospital = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<IHospitalSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedHospital, setSelectedHospital] = useState<IHospitalSubscription | null>(null);

  const fetchHospitals = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await superAdminApi.getHospitalSubscriptions({
        page,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        filter: activeTab === 'All' ? undefined : activeTab === 'Active' ? 'active' : 'expired',
      });

      const rawData = response.data.data || [];
      const pagination = response.data.pagination || {};

      const mappedData: IHospitalSubscription[] = rawData.map((item: any) => ({
        id: item.id,
        hospitalId: item.id,
        hospitalName: item.hospitalName,
        hospitalEmail: item.email,
        hospitalPhone: item.phone,
        hospitalAddress: item.address,
        contactPerson: item.contactPerson || '—',
        planName: item.subscription?.plan || 'free',
        amount: item.subscription?.amount ?? 0,
        status: item.subscription?.status || 'expired',
        startDate: item.subscription?.startDate || '',
        endDate: item.subscription?.endDate || '',
        createdAt: item.createdAt,
        durationUnit: item.subscription?.durationUnit || 'months',
        duration: item.subscription?.duration ?? 0,
        logoUrl: item.logo || '',
      }));

      setHospitals(mappedData);
      setTotalPages(pagination.totalPages || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch hospital subscriptions:', error);
      toast.error('Failed to load hospital subscriptions');
      setHospitals([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);
  useEffect(() => {
    fetchHospitals(currentPage);
  }, [currentPage, fetchHospitals]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHospitals(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, fetchHospitals]);

  const renderRow = (hospital: IHospitalSubscription) => {
    const statusCfg = getStatusConfig(hospital.status, hospital.endDate);
    const daysLeft = getDaysRemaining(hospital.endDate);
    const isExpired = daysLeft <= 0 || hospital.status === 'expired';

    return (
      <tr
        key={hospital.id}
        className="hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setSelectedHospital(hospital)}
      >
        {/* Hospital */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-linear-to-br from-slate-50 to-slate-100 shrink-0 border border-gray-200 flex items-center justify-center">
              {hospital.logoUrl
                ? <img src={hospital.logoUrl} alt="" className="w-10 h-10 object-contain" />
                : <Building2 className="w-6 h-6 text-slate-400" />
              }
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate max-w-45">{hospital.hospitalName}</div>
              <div className="text-xs text-gray-500">ID: {hospital.hospitalId?.slice(-8) || hospital.id.slice(-8)}</div>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.badgeClass}`}>
            <Circle className={`w-2.5 h-2.5 fill-current ${statusCfg.dotColor.replace('bg-', 'text-')}`} />
            {statusCfg.label}
          </span>
        </td>

        {/* Plan */}
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${getPlanTypeColor(hospital.planName)}`}>
            {hospital.planName}
          </span>
        </td>

        {/* Amount */}
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
            {formatPrice(hospital.amount)}
          </span>
        </td>

        {/* Start */}
        <td className="px-6 py-4 text-gray-700 text-sm">{formatDate(hospital.startDate)}</td>

        {/* End / Expiry */}
        <td className="px-6 py-4">
          <div className={`text-sm font-medium ${isExpired ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-gray-700'}`}>
            {formatDate(hospital.endDate)}
          </div>
          {!isExpired && daysLeft > 0 && daysLeft <= 7 && (
            <div className="text-xs text-amber-500 mt-0.5">{daysLeft}d left</div>
          )}
          {isExpired && (
            <div className="text-xs text-red-400 mt-0.5">Expired</div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospital Subscriptions</h1>
              <p className="text-gray-600 mt-1">View and monitor subscriptions taken by hospitals.</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* Tabs + Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex gap-2">
                  {['All', 'Active', 'Expired'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as 'All' | 'Active' | 'Expired')}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm ${
                        activeTab === tab
                          ? 'bg-slate-700 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by hospital name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Loading hospital subscriptions...
                </div>
              ) : hospitals.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No hospital subscriptions found matching your criteria.
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Hospital</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Plan</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hospitals.map(renderRow)}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedHospital && (
        <DetailModal
          hospital={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
};

export default SubscriptionHospital;