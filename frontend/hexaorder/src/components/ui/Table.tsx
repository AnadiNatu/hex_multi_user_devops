import React, { ReactNode, useState } from 'react';
import { cn } from '../../utils/helpers';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface Column<T> {
  key:       string;
  header:    string;
  render?:   (item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data:              T[];
  columns:           Column<T>[];
  keyExtractor:      (item: T) => string;
  selectable?:       boolean;
  onSelectionChange?: (selected: string[]) => void;
  className?:        string;
  emptyMessage?:     string;
  striped?:          boolean;
  hoverable?:        boolean;
  bordered?:         boolean;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  selectable        = false,
  onSelectionChange,
  className,
  emptyMessage      = 'No data available',
  striped           = false,
  hoverable         = true,
  bordered          = false,
}: TableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(data.map(keyExtractor));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) newSelected.add(id); else newSelected.delete(id);
    setSelectedRows(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const allSelected  = data.length > 0 && selectedRows.size === data.length;
  const someSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {selectable && (
              <th className="px-6 py-3.5 w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key} className={cn('px-6 py-3.5 text-[0.68rem] font-bold text-slate-500 uppercase tracking-wider', column.className)}>
                {column.sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
                  >
                    {column.header}
                    {sortConfig?.key === column.key ? (
                      sortConfig.direction === 'asc' ? <ArrowUp className="w-3.5 h-3.5" /> : <ArrowDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
                    )}
                  </button>
                ) : column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(bordered ? 'divide-y divide-slate-200' : 'divide-y divide-slate-100')}>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-6 py-14 text-center text-slate-400 text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => {
              const id         = keyExtractor(item);
              const isSelected = selectedRows.has(id);

              return (
                <tr
                  key={id}
                  className={cn(
                    'transition-all duration-150',
                    hoverable && 'table-row-hover-green cursor-pointer',
                    striped && index % 2 === 0 && 'bg-slate-50/40',
                    isSelected && 'bg-brand-green/5'
                  )}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(id, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-6 py-4 text-sm text-slate-700', column.className)}>
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}