import type { Meta, StoryObj } from '@storybook/react-vite'

import { Separator } from '@/components/ui/separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-sm font-medium">Levering</p>
      <p className="text-sm text-muted-foreground">Dato, tid og adresse.</p>
      <Separator className="my-3" />
      <p className="text-sm font-medium">Betaling</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-3 text-sm">
      <span>Ordrer</span>
      <Separator orientation="vertical" />
      <span>Kunder</span>
      <Separator orientation="vertical" />
      <span>Produkter</span>
    </div>
  ),
}
