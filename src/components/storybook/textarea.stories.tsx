import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'Leveringsinstruks …' },
}

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="note">Hilsen på kortet</Label>
      <Textarea {...args} id="note" />
    </div>
  ),
  args: { placeholder: 'Gratulerer med dagen!' },
}

export const Disabled: Story = {
  args: { defaultValue: 'Låst innhold', disabled: true },
}

export const Invalid: Story = {
  args: { defaultValue: 'For langt …', 'aria-invalid': true },
}
