import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PackagePlus, PackageSearch } from 'lucide-react'

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

import type { AddProductFormValues } from '#/components/AddProductForm'
import AddProductForm from '#/components/AddProductForm'
import { productColumns } from '#/components/ProductColumns'
import { getAllProducts, insertProduct } from '#/lib/product-server-fns'
import { queryKeys } from '#/lib/query-keys'
import { getStoredSettings } from '@/lib/settings'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const pageSize = getStoredSettings().rowsPerPage

  const { data = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => getAllProducts(),
  })

  const addMutation = useMutation({
    mutationFn: (values: AddProductFormValues) =>
      insertProduct({ data: { ...values, price: Number(values.price) } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
  })

  async function handleAddProduct(values: AddProductFormValues) {
    await addMutation.mutateAsync(values)
    setAddOpen(false)
  }

  return (
    <main className="rise-in page-wrap px-4 pb-8 pt-6">
      <div className="flex items-center gap-2 mb-4">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <PackageSearch />
          </InputGroupAddon>
          <InputGroupInput
            id="product-table-search"
            name="product-table-search"
            autoComplete="off"
            placeholder="Søk etter produkt..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
        <Button onClick={() => setAddOpen(true)}>
          <PackagePlus />
          <span className="hidden sm:inline">Legg til produkt</span>
        </Button>
      </div>
      <DataTable
        columns={productColumns}
        data={data}
        globalFilter={globalFilter}
        emptyMessage="Ingen produkter funnet."
        pagination
        pageSize={pageSize}
      />
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til produkt</DialogTitle>
            <DialogDescription>
              Registrer et nytt produkt i katalogen.
            </DialogDescription>
          </DialogHeader>
          <AddProductForm
            saveText="Legg til"
            close
            disabled={addMutation.isPending}
            onSubmit={handleAddProduct}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
