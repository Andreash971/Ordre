import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { FileDown, Plus, Printer, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { onClick: fn(), children: 'Knapp' },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'secondary',
        'ghost',
        'destructive',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: [
        'xs',
        'sm',
        'default',
        'lg',
        'icon-xs',
        'icon-sm',
        'icon',
        'icon-lg',
      ],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Lagre ordre' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Avbryt' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Sekundær' },
}

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Slett kunde' },
}

export const Link: Story = {
  args: { variant: 'link', children: 'Vis detaljer' },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Printer data-icon="inline-start" />
        Skriv ut
      </>
    ),
  },
}

export const IconOnly: Story = {
  args: {
    size: 'icon',
    variant: 'outline',
    'aria-label': 'Legg til',
    children: <Plus />,
  },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Deaktivert' },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="xs">Ekstra liten</Button>
      <Button size="sm">Liten</Button>
      <Button size="default">Standard</Button>
      <Button size="lg">Stor</Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">
        <Trash2 data-icon="inline-start" />
        Destructive
      </Button>
      <Button variant="link">
        <FileDown data-icon="inline-start" />
        Link
      </Button>
    </div>
  ),
}

export const ClickInteraction: Story = {
  args: { children: 'Klikk meg' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Klikk meg' }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
