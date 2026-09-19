import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ 
  columns, 
  data, 
  keyExtractor, 
  onRowClick,
  actions,
  pagination
}: DataTableProps<T>) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((col, i) => (
                <th key={i} className={`px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-6 py-4 w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-10 text-center text-slate-500">
                  No data available.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                  <tr 
                  key={keyExtractor(row)} 
                  onClick={() => onRowClick?.(row)}
                  className={`group ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
                >
                  {columns.map((col, i) => (
                    <td key={i} className={`px-6 py-4 text-sm text-slate-900 ${col.className || ''}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as ReactNode)}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <div className="text-sm text-slate-500">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => pagination.onPageChange(Math.max(1, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => pagination.onPageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export DataTable so we can use it, in a real app we might create wrappers like ProductsTable here
