import type { Meta, StoryObj } from '@storybook/react-vite'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

const products = [
  'Rose, rød',
  'Tulipan, blandet',
  'Solsikke',
  'Lilje, hvit',
  'Nellik',
  'Orkidé',
  'Pion',
  'Eukalyptus',
  'Gipsurt',
  'Fresia',
  'Iris',
  'Hortensia',
]

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-56 w-56 rounded-lg border">
      <div className="p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Produkter
        </p>
        {products.map((name, i) => (
          <div key={name} className="text-sm">
            {i > 0 && <Separator className="my-2" />}
            {name}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
