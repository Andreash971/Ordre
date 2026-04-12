import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PackagePlus, PackageSearch } from 'lucide-react'

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

import AddProductForm, {
  type AddProductFormValues,
} from '#/components/AddProductForm'
import { productColumns } from '#/components/ProductColumns'
import {
  type Product,
  getAllProducts,
  insertProduct,
} from '#/lib/product-server-fns'
import { getStoredSettings } from '@/lib/settings'

export const Route = createFileRoute('/products')({
  loader: () => getAllProducts(),
  component: ProductsPage,
})

function ProductsPage() {
  const loaderData = Route.useLoaderData()
  const [data, setData] = useState<Product[]>(loaderData)
  const [globalFilter, setGlobalFilter] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const pageSize = getStoredSettings().rowsPerPage

  async function handleAddProduct(values: AddProductFormValues) {
    const newRow = await insertProduct({
      data: { ...values, price: Number(values.price) },
    })
    setData((prev) => [
      {
        id: newRow.id,
        name: values.name,
        category: values.category || null,
        price: newRow.price,
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
            <PackageSearch />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Søk etter produkt..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </InputGroup>
        <Button onClick={() => setAddOpen(true)}>
          <PackagePlus />
          Legg til produkt
        </Button>
      </div>
      <DataTable
        columns={productColumns}
        data={data}
        setData={setData}
        globalFilter={globalFilter}
        emptyMessage="Ingen produkter funnet."
        pagination
        pageSize={pageSize}
      />
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Legg til produkt</DialogTitle>
          </DialogHeader>
          <AddProductForm
            saveText="Legg til"
            close
            onSubmit={handleAddProduct}
          />
        </DialogContent>
      </Dialog>
    </main>
  )
}
