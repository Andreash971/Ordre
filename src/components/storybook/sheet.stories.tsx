import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function DemoSheet({ side }: { side: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Åpne fra {side}</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Ordredetaljer</SheetTitle>
          <SheetDescription>
            Panelet appen bruker til å vise en ordre fra tabellen.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Kunde</span>
            <span>Kari Nordmann</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Levering</span>
            <span>10. juli, 12:00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sum</span>
            <span>890 kr</span>
          </div>
        </div>
        <SheetFooter>
          <Button>Skriv ut</Button>
          <SheetClose asChild>
            <Button variant="outline">Lukk</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const Right: Story = {
  render: () => <DemoSheet side="right" />,
}

export const Left: Story = {
  render: () => <DemoSheet side="left" />,
}

export const Bottom: Story = {
  render: () => <DemoSheet side="bottom" />,
}

export const Top: Story = {
  render: () => <DemoSheet side="top" />,
}
