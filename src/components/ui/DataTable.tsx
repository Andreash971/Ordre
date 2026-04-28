import { createContext, useContext, useMemo, useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    priority?: 'primary' | 'secondary'
    action?: boolean
    truncate?: boolean
  }
}

type DataTableSheetContextValue = {
  openSheet: (rowId: string) => void
  closeSheet: () => void
  isInSheet: boolean
}

const DataTableSheetContext = createContext<DataTableSheetContextValue | null>(
  null,
)

export function useDataTableSheet(): DataTableSheetContextValue {
  return (
    useContext(DataTableSheetContext) ?? {
      openSheet: () => {},
      closeSheet: () => {},
      isInSheet: false,
    }
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData?: React.Dispatch<React.SetStateAction<TData[]>>
  footer?: React.ReactNode
  emptyMessage?: React.ReactNode
  globalFilter?: string
  pagination?: boolean
  pageSize?: number
  rowClassName?: (row: Row<TData>) => string | undefined
  onRowClick?: (row: Row<TData>) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  footer,
  emptyMessage,
  globalFilter,
  pagination = false,
  pageSize = 10,
  rowClassName,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0)
  const [sheetRowId, setSheetRowId] = useState<string | null>(null)
  const isMobile = useIsMobile()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pagination && { getPaginationRowModel: getPaginationRowModel() }),
    state: {
      globalFilter: globalFilter ?? '',
      ...(pagination && { pagination: { pageIndex, pageSize } }),
    },
    onPaginationChange: pagination
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater({ pageIndex, pageSize })
              : updater
          setPageIndex(next.pageIndex)
        }
      : undefined,
    manualPagination: false,
    meta: {
      updateData: (rowIndex: number, columnId: string, value: number) => {
        setData?.((prev) =>
          prev.map((row, i) =>
            i === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        )
      },
      removeRow: (rowIndex: number) => {
        setData?.((prev) => prev.filter((_, i) => i !== rowIndex))
      },
      updateRow: (rowIndex: number, values: Record<string, unknown>) => {
        setData?.((prev) =>
          prev.map((row, i) => (i === rowIndex ? { ...row, ...values } : row)),
        )
      },
    },
  })

  const rows = table.getRowModel().rows
  const sheetRow = sheetRowId
    ? (rows.find((r) => r.id === sheetRowId) ?? null)
    : null

  const leafColumns = table.getAllLeafColumns()
  const primaryColumns = leafColumns.filter(
    (c) => c.columnDef.meta?.priority === 'primary',
  )
  const mobilePrimaryIds = new Set(
    (primaryColumns.length > 0
      ? primaryColumns
      : leafColumns.filter((c) => !c.columnDef.meta?.action).slice(0, 1)
    ).map((c) => c.id),
  )

  const isColumnVisibleOnMobile = (columnId: string) =>
    mobilePrimaryIds.has(columnId)

  const headerRow = table.getHeaderGroups()[0]

  const rowSheetContext = useMemo<DataTableSheetContextValue>(
    () => ({
      openSheet: (rowId: string) => setSheetRowId(rowId),
      closeSheet: () => setSheetRowId(null),
      isInSheet: false,
    }),
    [],
  )

  const inSheetContext = useMemo<DataTableSheetContextValue>(
    () => ({
      openSheet: (rowId: string) => setSheetRowId(rowId),
      closeSheet: () => setSheetRowId(null),
      isInSheet: true,
    }),
    [],
  )

  return (
    <DataTableSheetContext.Provider value={rowSheetContext}>
      <div className="flex flex-col gap-2 flex-1 min-h-0 min-w-0 w-full">
        <div className="rounded-md border overflow-hidden flex flex-col flex-1 min-h-0 min-w-0">
          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto">
            <Table className="overflow-visible">
              <TableHeader className="sticky top-0 bg-background">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers
                      .filter(
                        (h) =>
                          !isMobile || isColumnVisibleOnMobile(h.column.id),
                      )
                      .map((header) => {
                        const meta = header.column.columnDef.meta
                        const truncateDesktop = meta?.truncate && !isMobile
                        const content = header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )
                        return (
                          <TableHead
                            key={header.id}
                            className={
                              truncateDesktop ? undefined : meta?.className
                            }
                          >
                            {truncateDesktop ? (
                              <div className={cn('truncate', meta.className)}>
                                {content}
                              </div>
                            ) : (
                              content
                            )}
                          </TableHead>
                        )
                      })}
                    {isMobile && <TableHead className="w-0" />}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.length ? (
                  rows.map((row) => {
                    const extraRowClass = rowClassName?.(row)
                    const handleRowClick = isMobile
                      ? () => setSheetRowId(row.id)
                      : onRowClick
                        ? () => onRowClick(row)
                        : undefined
                    const clickable = Boolean(handleRowClick)
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={handleRowClick}
                        className={cn(
                          clickable && 'cursor-pointer',
                          extraRowClass,
                        )}
                      >
                        {row
                          .getVisibleCells()
                          .filter(
                            (cell) =>
                              !isMobile ||
                              isColumnVisibleOnMobile(cell.column.id),
                          )
                          .map((cell) => {
                            const meta = cell.column.columnDef.meta
                            const rendered = flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )
                            const truncateDesktop = meta?.truncate && !isMobile
                            return (
                              <TableCell
                                key={cell.id}
                                className={
                                  truncateDesktop ? undefined : meta?.className
                                }
                              >
                                {truncateDesktop ? (
                                  <div
                                    className={cn('truncate', meta.className)}
                                  >
                                    {rendered}
                                  </div>
                                ) : (
                                  rendered
                                )}
                              </TableCell>
                            )
                          })}
                        {isMobile && (
                          <TableCell className="w-0 pr-3 text-muted-foreground">
                            <ChevronRight className="size-4" />
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        isMobile ? mobilePrimaryIds.size + 1 : columns.length
                      }
                      className="h-24 text-center"
                    >
                      {emptyMessage ?? 'Ingen resultater.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {footer && (
            <Table className="overflow-x-clip">
              <TableFooter>{footer}</TableFooter>
            </Table>
          )}
        </div>
        {pagination && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Side {table.getState().pagination.pageIndex + 1} av{' '}
              {table.getPageCount()}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size={isMobile ? 'icon-sm' : 'sm'}
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                aria-label="Forrige side"
              >
                {isMobile ? <ChevronLeft className="size-4" /> : 'Forrige'}
              </Button>
              <Button
                variant="outline"
                size={isMobile ? 'icon-sm' : 'sm'}
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                aria-label="Neste side"
              >
                {isMobile ? <ChevronRight className="size-4" /> : 'Neste'}
              </Button>
            </div>
          </div>
        )}

        <Sheet
          open={sheetRow != null}
          onOpenChange={(open) => {
            if (!open) setSheetRowId(null)
          }}
        >
          <SheetContent
            side="right"
            className="w-full gap-0 sm:max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <SheetHeader>
              <SheetTitle>Detaljer</SheetTitle>
              <SheetDescription className="sr-only">
                Detaljer for valgt rad.
              </SheetDescription>
            </SheetHeader>
            {sheetRow && (
              <>
                <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
                  {sheetRow.getVisibleCells().map((cell) => {
                    if (cell.column.columnDef.meta?.action) return null
                    const header = headerRow.headers.find(
                      (h) => h.column.id === cell.column.id,
                    )
                    const headerContent =
                      header && !header.isPlaceholder
                        ? flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        : null
                    return (
                      <div
                        key={cell.id}
                        className="flex flex-col gap-1 border-b pb-2 last:border-b-0"
                      >
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {headerContent || cell.column.id}
                        </div>
                        <div className="text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {sheetRow
                  .getVisibleCells()
                  .some((c) => c.column.columnDef.meta?.action) && (
                  <SheetFooter className="flex-row items-center justify-end gap-2 border-t">
                    <DataTableSheetContext.Provider value={inSheetContext}>
                      {sheetRow
                        .getVisibleCells()
                        .filter((c) => c.column.columnDef.meta?.action)
                        .map((cell) => (
                          <div
                            key={cell.id}
                            className="flex items-center gap-2"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        ))}
                    </DataTableSheetContext.Provider>
                  </SheetFooter>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </DataTableSheetContext.Provider>
  )
}
