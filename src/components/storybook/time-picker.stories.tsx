import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { TimePicker } from '@/components/ui/time-picker'

const meta = {
  title: 'UI/TimePicker',
  component: TimePicker,
  args: {
    value: '16:00',
    onChange: () => {},
  },
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState<string | null>('16:00')
    return <TimePicker value={value} onChange={setValue} />
  },
}

export const Empty: Story = {
  render: function EmptyStory() {
    const [value, setValue] = useState<string | null>(null)
    return <TimePicker value={value} onChange={setValue} />
  },
}

export const AllowNull: Story = {
  render: function AllowNullStory() {
    const [value, setValue] = useState<string | null>('12:30')
    return <TimePicker value={value} onChange={setValue} allowNull />
  },
}

export const Disabled: Story = {
  args: { value: '16:00', disabled: true },
}
