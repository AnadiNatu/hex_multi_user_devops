// src/components/ui/AdminStatistics.tsx
// FIX: stat title text-slate-400, value uses passed color class, bg dark card.

// interface StatItem {
//   title: string;
//   value: string | number;
//   color: string;
// }
// interface Stat {
//   title: string;
//   value: string | number;
//   color: string;   // Tailwind text color e.g. 'text-emerald-400'
// }


// interface Props {
//   statItem: StatItem[];
//   stat: Stat[];
// }

// export default function AdminStatistics({ stat }: Props) {
//   return (
//     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//       {stat.map((stat) => (
//         <div
//           key={stat.title}
//           className="
//             bg-slate-800/60 border border-slate-700/60
//             rounded-2xl p-5 shadow-lg backdrop-blur-sm
//           "
//         >
//           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
//             {stat.title}
//           </p>
//           <p className={`text-3xl font-extrabold tracking-tight ${stat.color}`}>
//             {stat.value}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }


interface Stat {
  title: string;
  value: string | number;
  color: string; // e.g. 'text-emerald-400'
}

interface Props {
  stats: Stat[];
}

export default function AdminStatistics({ stats }: Props) {
  if (!stats?.length) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.title}
          className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 shadow-lg backdrop-blur-sm"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {s.title}
          </p>
          <p className={`text-3xl font-extrabold tracking-tight ${s.color}`}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
