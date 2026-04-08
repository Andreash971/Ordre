import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { UserPlus } from 'lucide-react'
import { UserSearch } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/DataTable'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import AddCustomerForm, {
  type AddCustomerFormValues,
} from '#/components/AddCustomerForm'
import { customerColumns } from '#/components/CustomerColumns'
import {
  type Customer,
  getAllCustomers,
  insertCustomer,
} from '#/lib/customer-server-fns'

export const Route = createFileRoute('/customers')({
  loader: () => getAllCustomers(),
  component: Customers,
})

function Customers() {
  const loaderData = Route.useLoaderData()
  const [data, setData] = useState<Customer[]>(loaderData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  async function handleAddCustomer(values: AddCustomerFormValues) {
    const newRow = await insertCustomer({ data: values })
    setData((prev) => [
      {
        id: newRow.id,
        name: values.name,
        phone: values.phone || null,
        business: values.company || null,
        address: values.address || null,
        postcode: values.postcode || null,
        city: values.city || null,
        careof: values.careof || null,
      },
      ...prev,
    ])
    setAddOpen(false)
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <UserSearch />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Søk etter kunde..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
        <Button onClick={() => setAddOpen(true)}>
          <UserPlus />
          Legg til kunde
        </Button>
      </div>
      <DataTable
        columns={customerColumns}
        data={data}
        setData={setData}
        globalFilter={globalFilter}
        emptyMessage="Ingen kunder funnet."
        pagination
        pageSize={14}
      />
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til kunde</DialogTitle>
          </DialogHeader>
          <AddCustomerForm
            saveText="Legg til"
            close
            onSubmit={handleAddCustomer}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
