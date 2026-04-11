import { columns } from './OrderColumns'
import type { Item } from './OrderColumns'
import { DataTable } from './ui/DataTable'
import { TableCell, TableRow } from '@/components/ui/table'

interface OrderTableProps {
  items: Item[]
  setItems: React.Dispatch<React.SetStateAction<Item[]>>
  className?: string
}

export default function OrderTable({
  items,
  setItems,
  className,
}: OrderTableProps) {
  const grandTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )
  const formatter = new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
  })

  return (
    <div className={`container mx-auto py-4 ${className}`}>
      <DataTable
        columns={columns}
        data={items}
        setData={setItems}
        emptyMessage={'Ordren er tom.'}
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
