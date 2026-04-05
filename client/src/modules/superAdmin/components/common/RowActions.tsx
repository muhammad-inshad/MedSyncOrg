import { Circle, Edit2 } from 'lucide-react';

interface RowActionsProps {
  isActive: boolean;
  onToggle: () => void;
  onEdit?: () => void;          // optional — SubscriptionHospital has no edit
  disabled?: boolean;
  toggleTitle?: { active: string; inactive: string };
}

const RowActions = ({
  isActive,
  onToggle,
  onEdit,
  disabled = false,
  toggleTitle = { active: 'Block', inactive: 'Activate' },
}: RowActionsProps) => (
  <div className="flex items-center gap-3">
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
        isActive
          ? 'bg-red-100 hover:bg-red-200 text-red-700'
          : 'bg-green-100 hover:bg-green-200 text-green-700'
      }`}
      title={isActive ? toggleTitle.active : toggleTitle.inactive}
    >
      <Circle className={`w-4 h-4 ${isActive ? 'fill-red-600' : 'fill-green-600'}`} />
    </button>

    {onEdit && (
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800 transition-colors"
        title="Edit"
      >
        <Edit2 className="w-5 h-5" />
      </button>
    )}
  </div>
);

export default RowActions;