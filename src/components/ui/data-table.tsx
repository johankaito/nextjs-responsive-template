"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useCallback, memo } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { useMobileViewport, useMobileViewportClasses } from "@/hooks/useMobileViewport";
import { cn } from "@/lib/utils";
import * as React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  searchPlaceholder?: string;
  filters?: {
    column: string;
    title: string;
    options: { label: string; value: string }[];
  }[];
  onBulkDelete?: (selectedRows: TData[]) => Promise<void> | void;
  // Optionally, add onBulkStatusChange, etc.
}

// Memoize the component
export const DataTable = memo(function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  filters,
  onBulkDelete,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  
  // Mobile viewport handling
  const { hasBottomBar, safeAreaBottom } = useMobileViewport();
  const mobileClasses = useMobileViewportClasses();

  // Memoize the selection column
  const selectionColumn = useMemo<ColumnDef<TData, TData>>(() => ({
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected() ? true : row.getIsSomeSelected() ? 'indeterminate' : false}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={e => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 1,
  }), []);

  // Memoize columns with selection
  const columnsWithSelection = useMemo(() => [selectionColumn, ...columns], [selectionColumn, columns]);

  const table = useReactTable({
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);

  // Memoize bulk delete handler
  const handleBulkDelete = useCallback(async () => {
    if (!onBulkDelete) return;
    setBulkDeleteLoading(true);
    try {
      await onBulkDelete(selectedRows);
      setRowSelection({});
      setShowBulkDelete(false);
    } finally {
      setBulkDeleteLoading(false);
    }
  }, [onBulkDelete, selectedRows]);

  // Memoize pagination handlers
  const handlePreviousPage = useCallback(() => table.previousPage(), [table]);
  const handleNextPage = useCallback(() => table.nextPage(), [table]);

  // Calculate dynamic styles for mobile
  const containerStyle = useMemo(() => {
    if (typeof window === 'undefined') return {};
    
    const style: React.CSSProperties = {};
    
    // Add padding for safe areas on mobile
    if (hasBottomBar || safeAreaBottom > 0) {
      style.paddingBottom = `${Math.max(safeAreaBottom, hasBottomBar ? 20 : 0)}px`;
    }
    
    return style;
  }, [hasBottomBar, safeAreaBottom]);

  return (
    <div className={cn("flex flex-col", mobileClasses)} style={containerStyle}>
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
      />
      <div className="flex-1 min-h-0 flex flex-col mobile-table-container">
        <div className={cn(
          "flex-1 min-h-0 overflow-auto rounded-md border -webkit-overflow-scrolling-touch",
          hasBottomBar && "mobile-safe-area"
        )}>
          <div className="min-w-full inline-block align-middle">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="whitespace-nowrap bg-background">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={row.getIsSelected() ? "bg-accent/30" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Bulk actions bar - at bottom of scrollable area */}
          {selectedRows.length > 0 && (
            <div className="sticky bottom-0 bg-muted/90 border-t border-border flex items-center justify-end gap-2 px-4 py-2 shadow-md">
              <span className="font-medium">{selectedRows.length} selected</span>
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDelete(true)}
                  disabled={bulkDeleteLoading}
                >
                  Delete Selected
                </Button>
              )}
              {/* Add more bulk actions here */}
            </div>
          )}
        </div>
        {/* Pagination now inside the flex container but outside the scrollable area */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-between px-2 py-2 border-x border-b rounded-b-md bg-background",
          hasBottomBar && "mb-safe" // Add margin bottom for safe area
        )}
        style={{
          marginBottom: hasBottomBar ? `${safeAreaBottom}px` : undefined
        }}>
          <div className="text-xs sm:text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!table.getCanPreviousPage()}
              className="h-8 px-2 sm:px-3"
            >
              <span className="sm:hidden">Prev</span>
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!table.getCanNextPage()}
              className="h-8 px-2 sm:px-3"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        title="Delete Selected?"
        description={`Are you sure you want to delete ${selectedRows.length} selected item(s)? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={bulkDeleteLoading}
      />
    </div>
  );
}); 