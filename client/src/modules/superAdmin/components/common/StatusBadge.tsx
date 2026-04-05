import { Circle } from 'lucide-react';

type Status = 'Active' | 'Inactive' | 'Pending' | 'Expired' | 'Expiring Soon' | string;

const STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-500',
  Inactive: 'bg-gray-400',
  Pending: 'bg-amber-600',
  Expired: 'bg-red-500',
  'Expiring Soon': 'bg-amber-400',
  Cancelled: 'bg-gray-400',
};

const StatusBadge = ({ status }: { status: Status }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${STATUS_COLORS[status] ?? 'bg-gray-500'}`}>
    <Circle className="w-2.5 h-2.5 fill-current" />
    {status}
  </span>
);

export default StatusBadge;