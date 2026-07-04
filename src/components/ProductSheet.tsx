import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

import type { AddProductFormValues } from '@/components/AddProductForm'
import AddProductForm from '@/components/AddProductForm'
import type { Product } from '@shared/products'
import { formatNok } from '@/lib/format'
import { deleteProduct, updateProduct } from '@/lib/product-server-fns'
import { queryKeys } from '@/lib/query-keys'

function ProductDetail({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all })

  const updateMutation = useMutation({
    mutationFn: (values: AddProductFormValues) =>
      updateProduct({
        data: { id: product.id, ...values, price: Number(values.price) },
      }),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct({ data: id }),
    onSuccess: invalidate,
  })

  function handleConfirmDelete() {
    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        onClose()
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <SheetHeader className="px-0">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Vare
        </div>
        <SheetTitle className="font-heading text-xl">{product.name}</SheetTitle>
        <SheetDescription>
          {[product.category, formatNok(Number(product.price))]
            .filter(Boolean)
            .join(' · ')}
        </SheetDescription>
      </SheetHeader>

      <div className="rounded-lg border p-3">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Vareinformasjon
        </div>
        <AddProductForm
          key={product.id}
          saveText="Lagre"
          disabled={updateMutation.isPending}
          defaultValues={{
            name: product.name,
            category: product.category,
            price: String(product.price),
            description: product.description ?? '',
          }}
          onSubmit={(values) => updateMutation.mutateAsync(values)}
        />
      </div>

      <div className="flex justify-start">
        <Button
          type="button"
          variant="destructive"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Slett vare
        </Button>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slett vare</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette{' '}
              <span className="font-medium">{product.name}</span>? Dette er
              permanent og kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={deleteMutation.isPending}>
                Avbryt
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Sletter...' : 'Slett'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Sidebar sheet for viewing/editing a product (same pattern as customers). */
export function ProductSheet({
  product,
  onOpenChange,
}: {
  product: Product | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={product !== null} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        {product ? (
          <ProductDetail
            product={product}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
