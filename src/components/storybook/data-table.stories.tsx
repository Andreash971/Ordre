import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/input'

type Order = {
  id: string
  customer: string
  city: string
  status: 'Åpen' | 'Skrevet ut' | 'Levert'
  total: number
}

const orders: Array<Order> = [
  {
    id: '1042',
    customer: 'Kari Nordmann',
    city: 'Bergen',
    status: 'Åpen',
    total: 890,
  },
  {
    id: '1043',
    customer: 'Bergen Blomster AS',
    city: 'Bergen',
    status: 'Skrevet ut',
    total: 2450,
  },
  {
    id: '1044',
    customer: 'Ola Hansen',
    city: 'Os',
    status: 'Åpen',
    total: 450,
  },
  {
    id: '1045',
    customer: 'Fana Hotell',
    city: 'Bergen',
    status: 'Levert',
    total: 1780,
  },
  {
    id: '1046',
    customer: 'Marit Berg',
    city: 'Askøy',
    status: 'Åpen',
    total: 620,
  },
  {
    id: '1047',
    customer: 'Nordnes Kafé',
    city: 'Bergen',
    status: 'Levert',
    total: 1150,
  },
  {
    id: '1048',
    customer: 'Per Olsen',
    city: 'Sotra',
    status: 'Skrevet ut',
    total: 390,
  },
  {
    id: '1049',
    customer: 'Åsane Storsenter',
    city: 'Bergen',
    status: 'Åpen',
    total: 3200,
  },
]

const statusVariant = {
  Åpen: 'soft',
  'Skrevet ut': 'secondary',
  Levert: 'outline',
} as const

const columns: Array<ColumnDef<Order, unknown>> = [
  {
    accessorKey: 'id',
    header: 'Ordre',
    cell: ({ row }) => <span className="font-mono">#{row.original.id}</span>,
    meta: { priority: 'primary' },
  },
  {
    accessorKey: 'customer',
    header: 'Kunde',
    meta: { priority: 'primary', truncate: true },
  },
  {
    accessorKey: 'city',
    header: 'Sted',
    meta: { priority: 'secondary' },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={statusVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'total',
    header: () => <div className="text-right">Sum</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.total} kr</div>
    ),
  },
]

const meta = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
// DataTable is generic, so the stories provide fully typed props via render
// instead of inheriting arg types from the meta.
type Story = StoryObj

export const Default: Story = {
  render: () => <DataTable columns={columns} data={orders} />,
}

export const WithPagination: Story = {
  render: () => (
    <DataTable columns={columns} data={orders} pagination pageSize={4} />
  ),
}

export const WithGlobalFilter: Story = {
  render: function WithGlobalFilterStory() {
    const [filter, setFilter] = useState('')
    return (
      <div className="space-y-3">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Søk i ordrer …"
          className="max-w-56"
        />
        <DataTable columns={columns} data={orders} globalFilter={filter} />
      </div>
    )
  },
}

export const EmptyState: Story = {
  render: () => (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="Ingen ordrer funnet."
    />
  ),
}
