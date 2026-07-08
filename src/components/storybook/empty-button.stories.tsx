import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { PackagePlus, UserPlus } from 'lucide-react'

import { EmptyButton } from '@/components/ui/empty-button'

const meta = {
  title: 'UI/EmptyButton',
  component: EmptyButton,
  args: { onClick: fn() },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: <PackagePlus />,
    title: 'Legg til produkt',
    description: 'Opprett et produkt som kan brukes i ordrer.',
  },
}

export const WithoutIcon: Story = {
  args: {
    title: 'Legg til kontaktperson',
  },
}

export const ClickInteraction: Story = {
  args: {
    icon: <UserPlus />,
    title: 'Ny kunde',
    description: 'Registrer en privat- eller bedriftskunde.',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /Ny kunde/ }))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}
