
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

export interface TableColumn {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn[];
  renderRow: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    message: string;
    icon?: ReactNode;
  };
  className?: string;
}

export interface ItemWithId {
  id: string | number;
}

export const DataTable = <T extends ItemWithId>({
  data,
  columns,
  renderRow,
  isLoading = false,
  emptyState,
  className = ""
}: DataTableProps<T>) => {
  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400 font-medium">Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
          {emptyState?.icon || <Search className="w-8 h-8 text-slate-300" />}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{emptyState?.title || "No data found"}</h3>
        <p className="text-slate-500">{emptyState?.message || "Try adjusting your search or filter."}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key}
                  className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, index) => (
              <tr key={item.id as string} className="hover:bg-slate-50/50 transition-all group">
                {renderRow(item, index)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};