
import { flexRender, Table } from '@tanstack/react-table';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface DataGridTableProps<TData> {
  table: Table<TData>;
  columnsLength: number;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
}

export function DataGridTable<TData>({
  table,
  columnsLength,
  isLoading,
  onRowClick,
}: DataGridTableProps<TData>) {
  return (
    <div className="rounded-md border border-border bg-card overflow-hidden">
      <table className="w-full text-sm text-left text-foreground">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="px-6 py-3 font-medium whitespace-nowrap"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-1 ${
                        header.column.getCanSort()
                          ? 'cursor-pointer select-none hover:text-foreground transition-colors'
                          : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="w-4 h-4" />,
                        desc: <ChevronDown className="w-4 h-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columnsLength}
                className="px-6 py-10"
              >
                <LoadingState text="Loading data..." className="min-h-[200px]" />
              </td>
            </tr>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`bg-card border-b border-border hover:bg-muted/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columnsLength}
                className="px-6 py-10"
              >
                <EmptyState title="No Results Found" description="Try adjusting your filters or search criteria." className="min-h-[200px] border-none bg-transparent" />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
