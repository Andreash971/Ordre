import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const meta = {
  title: 'UI/Input',
  component: Input,
  args: { onChange: fn() },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'tel', 'number', 'password', 'search', 'date'],
    },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'Kundenavn' },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="phone">Telefon</Label>
      <Input {...args} id="phone" />
    </div>
  ),
  args: { type: 'tel', placeholder: '+47 999 99 999' },
}

export const WithValue: Story = {
  args: { defaultValue: 'Fjellveien 12, 5019 Bergen' },
}

export const Disabled: Story = {
  args: { placeholder: 'Kan ikke redigeres', disabled: true },
}

export const Invalid: Story = {
  args: {
    defaultValue: 'ikke-en-epost',
    type: 'email',
    'aria-invalid': true,
  },
}
