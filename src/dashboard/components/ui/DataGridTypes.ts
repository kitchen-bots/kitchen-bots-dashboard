import { Table } from '@tanstack/react-table';

/**
 * DataGrid Future Capabilities Architecture
 * 
 * This file defines the contracts and extension points for future DataGrid 
 * features. Do not implement runtime code for these until required by the business.
 */

/**
 * Column Visibility & Pinning Architecture
 * Hook will tap into TanStack's built-in visibility and pinning state.
 */
export interface UseDataGridVisibility<TData> {
  // Returns true if a column can be hidden
  getCanHide: (columnId: string) => boolean;
  // Toggles column visibility
  toggleVisibility: (columnId: string, isVisible: boolean) => void;
  // Returns UI component for column visibility dropdown
  renderVisibilityDropdown: (table: Table<TData>) => React.ReactNode;
}

export interface UseDataGridPinning {
  // Pins column to left or right
  pinColumn: (columnId: string, position: 'left' | 'right' | false) => void;
  // Gets pinned state
  getPinnedState: () => { left?: string[], right?: string[] };
}

/**
 * Export Architecture
 * Provides standard hooks for CSV/Excel export.
 */
export interface DataGridExportOptions {
  fileName?: string;
  excludeColumns?: string[];
  includeHiddenColumns?: boolean;
}

export interface UseDataGridExport<TData> {
  exportToCSV: (table: Table<TData>, options?: DataGridExportOptions) => Promise<void>;
  exportToExcel: (table: Table<TData>, options?: DataGridExportOptions) => Promise<void>;
}

/**
 * Density Architecture
 * Controls cell padding and font sizes.
 */
export type DataGridDensity = 'compact' | 'normal' | 'comfortable';

export interface UseDataGridDensity {
  density: DataGridDensity;
  setDensity: (density: DataGridDensity) => void;
  // Returns Tailwind classes based on density state
  getCellClasses: () => string; 
}

/**
 * Virtualization Architecture
 * Wraps @tanstack/react-virtual for massive datasets.
 */
export interface UseDataGridVirtualizer<TElement extends Element> {
  virtualRows: any[]; // mapped to VirtualItem[] from react-virtual
  totalSize: number;
  // Ref to attach to the scroll container
  scrollContainerRef: React.RefObject<TElement>;
}
