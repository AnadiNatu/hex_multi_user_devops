// src/components/ui/AdminStatistics.tsx
// FIX: stat title text-slate-400, value uses passed color class, bg dark card.

interface StatItem {
  title: string;
  value: string | number;
  color: string;
}

interface Props {
  stats: StatItem[];
}

export default function AdminStatistics({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.title}
             className="bg-slate-900/70 border border-slate-700 rounded-2xl p-4 shadow-lg">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
            {stat.title}
          </p>
          <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}