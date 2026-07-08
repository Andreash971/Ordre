import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { Chip } from '@/components/ui/chip'

const meta = {
  title: 'UI/Chip',
  component: Chip,
  args: { onClick: fn(), children: 'Chip' },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Hurtigvalg' },
}

export const Selected: Story = {
  args: { selected: true, children: 'Valgt' },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Deaktivert' },
}

/** Quick-pick row like the delivery time presets in new order. */
export const QuickPickRow: Story = {
  render: function QuickPickRowStory() {
    const options = ['I dag', 'I morgen', 'Neste uke', 'Egen dato']
    const [selected, setSelected] = useState('I dag')
    return (
      <div className="flex gap-1.5">
        {options.map((option) => (
          <Chip
            key={option}
            selected={selected === option}
            onClick={() => setSelected(option)}
          >
            {option}
          </Chip>
        ))}
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const tomorrow = canvas.getByRole('button', { name: 'I morgen' })
    await userEvent.click(tomorrow)
    await expect(tomorrow).toHaveAttribute('data-selected')
    await expect(
      canvas.getByRole('button', { name: 'I dag' }),
    ).not.toHaveAttribute('data-selected')
  },
}
