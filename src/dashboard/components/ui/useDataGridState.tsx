import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
  SortingState,
  RowSelectionState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Checkbox } from './Checkbox';

export interface UseDataGridStateProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: (pagination: PaginationState) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
  globalFilter?: string;
  onGlobalFilterChange?: (filter: string) => void;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
}

export function useDataGridState<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  enableRowSelection = false,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
}: UseDataGridStateProps<TData, TValue>) {
  
  const [internalPagination, setInternalPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalGlobalFilter, setInternalGlobalFilter] = useState('');
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);

  const isControlledPagination = controlledPagination !== undefined;
  const isControlledSorting = controlledSorting !== undefined;
  const isControlledRowSelection = controlledRowSelection !== undefined;
  const isControlledGlobalFilter = controlledGlobalFilter !== undefined;
  const isControlledColumnFilters = controlledColumnFilters !== undefined;

  const finalColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!enableRowSelection) return columns as unknown as ColumnDef<TData, unknown>[];
    return [
      {
        id: 'selection',
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...(columns as unknown as ColumnDef<TData, unknown>[]),
    ];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: finalColumns,
    pageCount: pageCount ?? -1,
    state: {
      pagination: isControlledPagination ? controlledPagination : internalPagination,
      sorting: isControlledSorting ? controlledSorting : internalSorting,
      rowSelection: isControlledRowSelection ? controlledRowSelection : internalRowSelection,
      globalFilter: isControlledGlobalFilter ? controlledGlobalFilter : internalGlobalFilter,
      columnFilters: isControlledColumnFilters ? controlledColumnFilters : internalColumnFilters,
    },
    enableRowSelection,
    onPaginationChange: (updater) => {
      if (isControlledPagination && onPaginationChange) {
        onPaginationChange(typeof updater === 'function' ? updater(controlledPagination) : updater);
      } else if (!isControlledPagination) {
        setInternalPagination(updater);
      }
    },
    onSortingChange: (updater) => {
      if (isControlledSorting && onSortingChange) {
        onSortingChange(typeof updater === 'function' ? updater(controlledSorting) : updater);
      } else if (!isControlledSorting) {
        setInternalSorting(updater);
      }
    },
    onRowSelectionChange: (updater) => {
      if (isControlledRowSelection && onRowSelectionChange) {
        onRowSelectionChange(typeof updater === 'function' ? updater(controlledRowSelection) : updater);
      } else if (!isControlledRowSelection) {
        setInternalRowSelection(updater);
      }
    },
    onGlobalFilterChange: (updater) => {
      if (isControlledGlobalFilter && onGlobalFilterChange) {
        onGlobalFilterChange(typeof updater === 'function' ? updater(controlledGlobalFilter) : updater);
      } else if (!isControlledGlobalFilter) {
        setInternalGlobalFilter(updater);
      }
    },
    onColumnFiltersChange: (updater) => {
      if (isControlledColumnFilters && onColumnFiltersChange) {
        onColumnFiltersChange(typeof updater === 'function' ? updater(controlledColumnFilters) : updater);
      } else if (!isControlledColumnFilters) {
        setInternalColumnFilters(updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: isControlledPagination,
    manualSorting: isControlledSorting,
    manualFiltering: isControlledGlobalFilter || isControlledColumnFilters,
  });

  return {
    table,
    globalFilter: isControlledGlobalFilter ? controlledGlobalFilter : internalGlobalFilter,
    setGlobalFilter: (val: string) => {
      if (isControlledGlobalFilter && onGlobalFilterChange) onGlobalFilterChange(val);
      else setInternalGlobalFilter(val);
    }
  };
}
