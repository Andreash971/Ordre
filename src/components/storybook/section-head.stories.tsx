import type { Meta, StoryObj } from '@storybook/react-vite'

import { SectionHead } from '@/components/SectionHead'

const meta = {
  title: 'App/SectionHead',
  component: SectionHead,
} satisfies Meta<typeof SectionHead>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: 'Levering' },
}

export const WithSubtitle: Story = {
  args: {
    title: 'Mottakere',
    sub: 'Én ordre skrives ut per mottaker.',
  },
}
