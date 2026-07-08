import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckCircle2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'soft', 'secondary', 'destructive', 'outline'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Ny' },
}

export const Soft: Story = {
  args: { variant: 'soft', children: 'Bedrift' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Utkast' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Feilet' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Privat' },
}

export const WithIcon: Story = {
  args: {
    variant: 'soft',
    children: (
      <>
        <CheckCircle2 />
        Skrevet ut
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}
