import Pagination from '@/components/Pagination';
import { Search } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;              // e.g. 'w-32' for Actions column
}

interface DataTableProps<T> {
  // data
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;

  // tabs
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // search
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;

  // pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // row click (optional — used in SubscriptionHospital)
  onRowClick?: (row: T) => void;
}

function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading = false,
  emptyMessage = 'No records found matching your criteria.',
  tabs,
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">

      {/* Tabs + Search bar */}
      {(tabs || onSearchChange) && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">

            {tabs && onTabChange && (
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tab)}
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
            )}

            {onSearchChange && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                  
                    key={col.key}
                    className={`text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase tracking-wider ${col.width ?? ''}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render(row)}
                    </td>
                  ))}
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
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default DataTable;