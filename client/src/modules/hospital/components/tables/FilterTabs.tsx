
interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  getCount?: (key: string) => number;
}

export const FilterTabs = ({ 
  tabs, 
  activeFilter, 
  onFilterChange, 
  getCount 
}: FilterTabsProps) => (
  <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8 inline-flex flex-wrap gap-1">
    {tabs.map((tab) => {
      const count = getCount ? getCount(tab.key) : undefined;
      return (
        <button
          key={tab.key}
          onClick={() => onFilterChange(tab.key)}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeFilter === tab.key
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          {tab.label}
          {count !== undefined && tab.key !== 'all' && (
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-md ${
              activeFilter === tab.key ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);