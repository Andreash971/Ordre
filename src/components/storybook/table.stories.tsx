import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const meta = {
  title: 'UI/Table',
  component: Table,
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const orders = [
  { id: '1042', customer: 'Kari Nordmann', delivery: '10. juli', total: 890 },
  {
    id: '1043',
    customer: 'Bergen Blomster AS',
    delivery: '10. juli',
    total: 2450,
  },
  { id: '1044', customer: 'Ola Hansen', delivery: '11. juli', total: 450 },
  { id: '1045', customer: 'Fana Hotell', delivery: '12. juli', total: 1780 },
]

export const Default: Story = {
  render: () => (
    <Table className="w-[560px]">
      <TableCaption>Åpne ordrer denne uken.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Ordre</TableHead>
          <TableHead>Kunde</TableHead>
          <TableHead>Levering</TableHead>
          <TableHead className="text-right">Sum</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-mono">#{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.delivery}</TableCell>
            <TableCell className="text-right">{order.total} kr</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Totalt</TableCell>
          <TableCell className="text-right">
            {orders.reduce((sum, o) => sum + o.total, 0)} kr
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <Table className="w-[560px]">
      <TableHeader>
        <TableRow>
          <TableHead>Kunde</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Bergen Blomster AS</TableCell>
          <TableCell>
            <Badge variant="soft">Bedrift</Badge>
          </TableCell>
          <TableCell>
            <Badge>Aktiv</Badge>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Kari Nordmann</TableCell>
          <TableCell>
            <Badge variant="outline">Privat</Badge>
          </TableCell>
          <TableCell>
            <Badge variant="secondary">Inaktiv</Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}
