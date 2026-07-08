import type { Meta, StoryObj } from '@storybook/react-vite'

import { MissingFieldsBadge } from '@/components/MissingFieldsBadge'

const meta = {
  title: 'App/MissingFieldsBadge',
  component: MissingFieldsBadge,
} satisfies Meta<typeof MissingFieldsBadge>

export default meta
type Story = StoryObj<typeof meta>

export const OneField: Story = {
  args: { fields: ['telefon'] },
}

export const SeveralFields: Story = {
  args: { fields: ['telefon', 'adresse', 'leveringsdato'] },
}

/** With no missing fields the badge renders nothing. */
export const NoFields: Story = {
  args: { fields: [] },
}
