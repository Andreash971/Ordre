import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, UserSearch } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/DataTable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

import type { AddCustomerFormValues } from '#/components/AddCustomerForm'
import AddCustomerForm from '#/components/AddCustomerForm'
import { customerColumns } from '#/components/CustomerColumns'
import { getAllCustomers, insertCustomer } from '#/lib/customer-server-fns'
import { queryKeys } from '#/lib/query-keys'
import { useSettings } from '@/lib/store-hooks'

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
})

function CustomersPage() {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const pageSize = useSettings().rowsPerPage

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
    <main className="rise-in page-wrap flex flex-col gap-4 px-4 pb-8 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Kunderegister
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Oversikt over alle kunder. Se, oppdater, endre, slett, eller legg til
          nye kunder i registeret.
        </p>
      </div>

      <div className="flex flex-row items-center justify-between w-full gap-2">
        <InputGroup className="w-full max-w-sm bg-card">
          <InputGroupAddon>
            <UserSearch />
          </InputGroupAddon>
          <InputGroupInput
            id="customer-search"
            name="customer-search"
            autoComplete="off"
            placeholder="Søk etter kunde..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
        <Button onClick={() => setAddOpen(true)} className="justify-self-end">
          <UserPlus />
          <span className="hidden sm:inline">Legg til kunde</span>
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
            <DialogDescription>
              Registrer en ny kunde i systemet.
            </DialogDescription>
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
