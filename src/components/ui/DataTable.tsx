import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef } from '@tanstack/react-table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string
  }
}

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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  setData: React.Dispatch<React.SetStateAction<TData[]>>
  footer?: React.ReactNode
  emptyMessage?: React.ReactNode
  globalFilter?: string
  pagination?: boolean
  pageSize?: number
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
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0)

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
        setData((prev) =>
          prev.map((row, i) =>
            i === rowIndex ? { ...row, [columnId]: value } : row,
          ),
        )
      },
      removeRow: (rowIndex: number) => {
        setData((prev) => prev.filter((_, i) => i !== rowIndex))
      },
      updateRow: (rowIndex: number, values: Record<string, unknown>) => {
        setData((prev) =>
          prev.map((row, i) => (i === rowIndex ? { ...row, ...values } : row)),
        )
      },
    },
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.className}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
                  {emptyMessage ?? 'Ingen resultater.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {footer && <TableFooter>{footer}</TableFooter>}
        </Table>
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
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Forrige
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Neste
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
