import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Archive } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { clearOrders } from '@/lib/order-server-fns'
import { queryKeys } from '@/lib/query-keys'

function ClearArchiveButton() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  function handleConfirm() {
    void clearOrders().then(() =>
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
    )
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Tøm arkiv</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tøm arkiv</DialogTitle>
          <DialogDescription>
            Er du sikker på at du vil tømme arkivet? Alle lagrede ordre vil bli
            slettet permanent og kan ikke gjenopprettes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Avbryt</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            Tøm arkiv
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function ClearArchiveSection() {
  return (
    <Item variant="outline" className="bg-card">
      <ItemMedia variant="icon">
        <Archive />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Tøm arkiv</ItemTitle>
        <ItemDescription>Slett alle lagrede ordre permanent.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ClearArchiveButton />
      </ItemActions>
    </Item>
  )
}
