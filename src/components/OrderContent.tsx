import { columns } from './OrderColumns'
import type { Item } from './OrderColumns'
import { DataTable } from './DataTable'
import { TableCell, TableRow } from '@/components/ui/table'

interface OrderContentProps extends React.PropsWithChildren {
  className: string
}

async function getData(): Promise<Omit<Item, 'quantity'>[]> {
  // Fetch data from your API here.
  return [
    {
      name: 'Roser',
      price: 59,
    },
    {
      name: 'Tulipan',
      price: 79,
    },
  ]
}

export default async function OrderContent({ className }: OrderContentProps) {
  const data: Item[] = (await getData()).map((item) => ({
    ...item,
    quantity: 1,
  }))

  const grandTotal = data.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const formatter = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  })

  return (
    <div className={`container mx-auto py-10 ${className}`}>
      <DataTable
        columns={columns}
        data={data}
        footer={
          <TableRow>
            <TableCell className="text-left font-medium">
              Totalt Beløp
            </TableCell>
            <TableCell colSpan={3} className="text-right font-medium">
              {formatter.format(grandTotal)}
            </TableCell>
            <TableCell />
          </TableRow>
        }
      />
    </div>
  )
}
