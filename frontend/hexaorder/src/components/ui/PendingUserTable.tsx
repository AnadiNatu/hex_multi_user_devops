// src/components/ui/PendingUserTable.tsx
// FIX: Table header bg-slate-800 text-slate-300, rows bg-white text-slate-800,
// empty/error states use correct contrast. Generic over row type T.

import { RefreshCw, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

interface Column<T> {
  key:       string;
  header:    string;
  sortable?: boolean;
  render?:   (row: T) => React.ReactNode;
}

interface Props<T> {
  data:           T[];
  columns:        Column<T>[];
  loading:        boolean;
  error:          string;
  keyExtractor:   (row: T) => string;
  emptyMessage?:  string;
  onRefresh?:     () => void;
  refreshLoading?: boolean;
  onApprove?:     (row: T) => void;
  onResetPassword?: (row: T) => void;
}

export default function PendingUsersTable<T>({
  data, columns, loading, error, keyExtractor,
  emptyMessage = 'No records found.',
  onRefresh, refreshLoading,
}: Props<T>) {

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-red-300 font-semibold">Failed to load data</p>
        <p className="text-slate-400 text-sm">{error}</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <Inbox className="w-10 h-10 text-slate-600" />
        <p className="text-slate-300 font-semibold">All caught up!</p>
        <p className="text-slate-500 text-sm">{emptyMessage}</p>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  isLoading={refreshLoading}>
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            {columns.map((col) => (
              <th key={col.key}
                  className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((row) => (
            <tr key={keyExtractor(row)} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}