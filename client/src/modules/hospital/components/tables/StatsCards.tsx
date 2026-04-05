import {type LucideIcon } from 'lucide-react';
interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface StatsCardsProps {
  stats: StatCardProps[];
}

export const StatsCards = ({ stats }: StatsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
    {stats.map((stat, i) => (
      <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-all">
        <div className={`p-3 rounded-xl ${stat.bg}`}>
          <stat.icon className={`w-6 h-6 ${stat.color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);