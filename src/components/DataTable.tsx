'use client'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import type { ColumnDef } from '@tanstack/react-table'

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
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setData,
  footer,
  emptyMessage,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    },
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
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
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage ?? 'Ingen resultater.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {footer && <TableFooter>{footer}</TableFooter>}
      </Table>
    </div>
  )
}
