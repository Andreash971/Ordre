import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
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

import type { AddCustomerFormValues } from '@/components/AddCustomerForm'
import AddCustomerForm from '@/components/AddCustomerForm'
import type { CustomerRow } from '@/components/CustomerColumns'
import {
  buildBusinessColumns,
  buildPrivateColumns,
} from '@/components/CustomerColumns'
import { ContactSubRows } from '@/components/CustomerContacts'
import type { ContactEditTarget } from '@/components/CustomerContacts'
import { CustomerSheet } from '@/components/CustomerSheet'
import CustomerTypeTabs from '@/components/CustomerTypeTabs'
import type { Contact } from '@/lib/contact-server-fns'
import { getAllContacts } from '@/lib/contact-server-fns'
import { getAllCustomers } from '@/lib/customer-server-fns'
import type { CustomerType } from '@/lib/customer-server-fns'
import type { CustomerSelection } from '@shared/customers'
import { clampCustomerType } from '@shared/modules'
import { resolveCustomerTypeDefault } from '@shared/settings'
import { useSaveCustomerMutation } from '@/hooks/use-save-customer-mutation'
import { queryKeys } from '@/lib/query-keys'
import { useEnabledCustomerTypes, useSettings } from '@/lib/store-hooks'

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
})

type SheetTarget = {
  customerId: number
  editContactId: ContactEditTarget
}

function CustomersPage() {
  const settings = useSettings()
  const enabledTypes = useEnabledCustomerTypes()
  const [tabState, setActiveTab] = useState<CustomerType>(() =>
    resolveCustomerTypeDefault(settings, 'customersPage'),
  )
  // The tab state can point at a module that was disabled after mount.
  const activeTab = clampCustomerType(settings.modules, tabState)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [sheetTarget, setSheetTarget] = useState<SheetTarget | null>(null)
  const pageSize = settings.rowsPerPage
  const isBusinessTab = activeTab === 'business'

  const { data: customers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => getAllCustomers(),
  })
  const { data: contacts = [] } = useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: () => getAllContacts(),
  })

  const allRows: CustomerRow[] = useMemo(() => {
    const byCompany = new Map<number, Contact[]>()
    for (const contact of contacts) {
      const list = byCompany.get(contact.customerId)
      if (list) list.push(contact)
      else byCompany.set(contact.customerId, [contact])
    }
    return customers.map((c) => ({ ...c, contacts: byCompany.get(c.id) ?? [] }))
  }, [customers, contacts])

  const tabRows = useMemo(
    () => allRows.filter((c) => c.type === activeTab),
    [allRows, activeTab],
  )

  // Resolved from live query data so the sheet reflects edits immediately and
  // closes itself if the customer is deleted elsewhere.
  const sheetCustomer = sheetTarget
    ? (allRows.find((c) => c.id === sheetTarget.customerId) ?? null)
    : null

  const columns = useMemo(() => {
    const callbacks = {
      onOpen: (customer: CustomerRow) =>
        setSheetTarget({ customerId: customer.id, editContactId: null }),
    }
    return isBusinessTab
      ? buildBusinessColumns(callbacks)
      : buildPrivateColumns(callbacks)
  }, [isBusinessTab])

  const addMutation = useSaveCustomerMutation()

  async function handleAddCustomer(
    values: AddCustomerFormValues,
    selection: CustomerSelection,
  ) {
    await addMutation.mutateAsync({ values, selection })
    setAddOpen(false)
    setActiveTab(selection.type)
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

      <CustomerTypeTabs
        value={activeTab}
        types={enabledTypes}
        onChange={setActiveTab}
      />

      <div className="flex flex-row items-center justify-between w-full gap-2">
        <InputGroup className="w-full max-w-sm bg-card">
          <InputGroupAddon>
            <UserSearch />
          </InputGroupAddon>
          <InputGroupInput
            id="customer-search"
            name="customer-search"
            autoComplete="off"
            placeholder={
              isBusinessTab
                ? 'Søk etter firma eller representant...'
                : 'Søk etter kunde...'
            }
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
        columns={columns}
        data={tabRows}
        globalFilter={globalFilter}
        emptyMessage={
          isBusinessTab ? 'Ingen firmakunder funnet.' : 'Ingen kunder funnet.'
        }
        pagination
        pageSize={pageSize}
        onRowClick={(row) =>
          setSheetTarget({ customerId: row.original.id, editContactId: null })
        }
        renderSubRows={
          isBusinessTab
            ? (row, visibleColumnCount) => (
                <ContactSubRows
                  contacts={row.original.contacts}
                  colSpan={visibleColumnCount}
                  onEditContact={(contactId) =>
                    setSheetTarget({
                      customerId: row.original.id,
                      editContactId: contactId,
                    })
                  }
                />
              )
            : undefined
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til kunde</DialogTitle>
            <DialogDescription>
              {enabledTypes.includes('business')
                ? 'Registrer en ny kunde, eller legg til en representant ved å velge et eksisterende firma.'
                : 'Registrer en ny kunde i registeret.'}
            </DialogDescription>
          </DialogHeader>
          <AddCustomerForm
            saveText="Legg til"
            close
            disabled={addMutation.isPending}
            defaultType={activeTab}
            allowExistingCompany
            onSubmit={handleAddCustomer}
          />
        </DialogContent>
      </Dialog>

      <CustomerSheet
        customer={sheetCustomer}
        editContactId={sheetTarget?.editContactId ?? null}
        onOpenChange={(open) => {
          if (!open) setSheetTarget(null)
        }}
      />
    </main>
  )
}
