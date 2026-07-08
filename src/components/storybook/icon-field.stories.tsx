import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MapPin, Phone, User } from 'lucide-react'

import { IconInputField } from '@/components/IconField'

const meta = {
  title: 'App/IconInputField',
  component: IconInputField,
  args: {
    label: 'Felt',
    icon: <User />,
    value: '',
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IconInputField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState('Kari Nordmann')
    return (
      <IconInputField
        label="Mottaker"
        icon={<User />}
        value={value}
        onChange={setValue}
      />
    )
  },
}

export const Missing: Story = {
  render: function MissingStory() {
    const [value, setValue] = useState('')
    return (
      <IconInputField
        label="Telefon"
        icon={<Phone />}
        value={value}
        onChange={setValue}
        missing={value === ''}
      />
    )
  },
}

export const Mono: Story = {
  render: function MonoStory() {
    const [value, setValue] = useState('5019')
    return (
      <IconInputField
        label="Postnummer"
        icon={<MapPin />}
        value={value}
        onChange={setValue}
        mono
      />
    )
  },
}
