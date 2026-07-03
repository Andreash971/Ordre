import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PackagePlus, PackageSearch, X } from 'lucide-react'

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

import type { AddProductFormValues } from '@/components/AddProductForm'
import AddProductForm from '@/components/AddProductForm'
import CategorySelect from '@/components/CategorySelect'
import { productColumns } from '@/components/ProductColumns'
import { getAllProducts, insertProduct } from '@/lib/product-server-fns'
import { queryKeys } from '@/lib/query-keys'
import { useSettings } from '@/lib/store-hooks'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [globalFilter, setGlobalFilter] = useState('')
  const [category, setCategory] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const pageSize = useSettings().rowsPerPage

  const { data = [] } = useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => getAllProducts(),
  })

  const categories = useMemo(() => {
    const set = new Set<string>()
    data.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'nb'))
  }, [data])

  const filtered = useMemo(() => {
    if (!category) return data
    return data.filter((p) => p.category === category)
  }, [data, category])

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
    <main className="rise-in page-wrap flex flex-col gap-4 px-4 pb-8 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-medium leading-tight">
          Varekatalog
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Oversikt over alle varer. Se, oppdater, endre, slett, eller legg til
          nye varer i katalogen.
        </p>
      </div>

      <div className="flex flex-row items-center justify-between w-full gap-2">
        <div className="flex flex-row items-center w-full gap-2">
          <InputGroup className="w-full max-w-sm bg-card">
            <InputGroupAddon>
              <PackageSearch />
            </InputGroupAddon>
            <InputGroupInput
              id="product-table-search"
              name="product-table-search"
              autoComplete="off"
              placeholder="Søk etter vare..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </InputGroup>
          <div className="flex items-center gap-1.5">
            <CategorySelect
              value={category}
              onChange={setCategory}
              categories={categories}
              placeholder="Alle kategorier"
              className="w-52"
            />
            {category ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setCategory('')}
                aria-label="Fjern kategorifilter"
              >
                <X />
              </Button>
            ) : null}
          </div>
        </div>
        <Button onClick={() => setAddOpen(true)} className="justify-self-end">
          <PackagePlus />
          <span className="hidden sm:inline">Legg til vare</span>
        </Button>
      </div>
      <DataTable
        columns={productColumns}
        data={filtered}
        globalFilter={globalFilter}
        emptyMessage="Ingen varer funnet."
        pagination
        pageSize={pageSize}
      />
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til vare</DialogTitle>
            <DialogDescription>
              Registrer en nytt vare i katalogen.
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
