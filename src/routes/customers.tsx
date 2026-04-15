import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { getAllCustomers, insertCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'
import { getStoredSettings } from '@/lib/settings'

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const pageSize = getStoredSettings().rowsPerPage

  const { data = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => getAllCustomers(),
  })

  const addMutation = useMutation({
    mutationFn: (values: AddCustomerFormValues) =>
      insertCustomer({ data: values }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })

  async function handleAddCustomer(values: AddCustomerFormValues) {
    await addMutation.mutateAsync(values)
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
        globalFilter={globalFilter}
        emptyMessage="Ingen kunder funnet."
        pagination
        pageSize={pageSize}
      />
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til kunde</DialogTitle>
          </DialogHeader>
          <AddCustomerForm
            saveText="Legg til"
            close
            disabled={addMutation.isPending}
            onSubmit={handleAddCustomer}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
