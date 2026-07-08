import type { Meta, StoryObj } from '@storybook/react-vite'

import { NoticeBanner } from '@/components/NoticeBanner'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'App/NoticeBanner',
  component: NoticeBanner,
  argTypes: {
    tone: { control: 'select', options: ['warning', 'success'] },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NoticeBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Warning: Story = {
  args: {
    tone: 'warning',
    title: 'Ordren mangler telefonnummer',
    description: 'Fyll inn mottakers telefon før utskrift.',
  },
}

export const Success: Story = {
  args: {
    tone: 'success',
    title: 'Alt klart',
    description: 'Ordren er komplett og kan skrives ut.',
  },
}

export const WithAction: Story = {
  args: {
    tone: 'warning',
    title: '2 ordrer mangler leveringsdato',
  },
  render: (args) => (
    <NoticeBanner {...args}>
      <Button size="sm" variant="outline">
        Vis ordrer
      </Button>
    </NoticeBanner>
  ),
}
