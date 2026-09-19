import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';
import { Table } from '@tanstack/react-table';

export interface DataGridToolbarProps<TData> {
  table: Table<TData>;
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (val: string) => void;
  renderToolbarActions?: (table: Table<TData>) => React.ReactNode;
}

export function DataGridToolbar<TData>({
  table,
  enableGlobalFilter,
  globalFilter,
  onGlobalFilterChange,
  renderToolbarActions,
}: DataGridToolbarProps<TData>) {
  if (!enableGlobalFilter && !renderToolbarActions) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      {enableGlobalFilter && (
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => onGlobalFilterChange?.(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        {renderToolbarActions && renderToolbarActions(table)}
      </div>
    </div>
  );
}
