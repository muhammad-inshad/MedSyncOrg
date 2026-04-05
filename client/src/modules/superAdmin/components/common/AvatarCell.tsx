import { type ReactNode } from 'react';

interface AvatarCellProps {
  src?: string;
  name: string;
  id: string;
  subText?: string;          // e.g. email
  fallbackIcon: ReactNode;   // pass <User /> or <Building2 /> from lucide
}

const AvatarCell = ({ src, name, id, subText, fallbackIcon }: AvatarCellProps) => (
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          {fallbackIcon}
        </div>
      )}
    </div>
    <div className="min-w-0">
      <div className="font-medium text-gray-900 truncate max-w-[180px]">{name}</div>
      <div className="text-xs text-gray-500">ID: {String(id || '').slice(-8) || 'N/A'}</div>
      {subText && <div className="text-xs text-gray-400 truncate max-w-[180px]">{subText}</div>}
    </div>
  </div>
);

export default AvatarCell;