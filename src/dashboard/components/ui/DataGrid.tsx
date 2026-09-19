import React from 'react';
import { ColumnDef, PaginationState, SortingState, RowSelectionState, ColumnFiltersState, Table } from '@tanstack/react-table';
import { useDataGridState } from './useDataGridState';
import { DataGridToolbar } from './DataGridToolbar';
import { DataGridTable } from './DataGridTable';
import { DataGridPagination } from './DataGridPagination';

export interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  total?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  
  // Row Selection
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
  
  // Global Filter
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  
  // Column Filters
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
  
  // Actions
  renderToolbarActions?: (table: Table<TData>) => React.ReactNode;
}

export function DataGrid<TData, TValue>(props: DataGridProps<TData, TValue>) {
  const { table, globalFilter, setGlobalFilter } = useDataGridState(props);

  return (
    <div className="w-full space-y-4">
      <DataGridToolbar
        table={table}
        enableGlobalFilter={props.enableGlobalFilter}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        renderToolbarActions={props.renderToolbarActions}
      />
      
      <DataGridTable
        table={table}
        columnsLength={table.getAllColumns().length}
        isLoading={props.isLoading}
        onRowClick={props.onRowClick}
      />

      <DataGridPagination
        table={table}
        total={props.total}
      />
    </div>
  );
}
