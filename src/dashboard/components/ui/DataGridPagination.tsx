
import { Table } from '@tanstack/react-table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface DataGridPaginationProps<TData> {
  table: Table<TData>;
  total?: number;
}

export function DataGridPagination<TData>({
  table,
  total,
}: DataGridPaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-neutral-body">
        {total !== undefined ? (
          <>
            Showing{' '}
            <span className="font-medium text-neutral-heading">
              {total === 0 ? 0 : table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-neutral-heading">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                total
              )}
            </span>{' '}
            of <span className="font-medium text-neutral-heading">{total}</span>{' '}
            entries
          </>
        ) : (
          <>
            Page{' '}
            <span className="font-medium text-neutral-heading">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            of{' '}
            <span className="font-medium text-neutral-heading">
              {table.getPageCount() <= 0 ? 1 : table.getPageCount()}
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
