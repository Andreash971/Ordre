import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { KpiCard } from '@/components/KpiCard'

const meta = {
  title: 'App/KpiCard',
  component: KpiCard,
  args: {
    label: 'Åpne ordrer',
    value: 12,
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KpiCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Åpne ordrer',
    value: 12,
  },
}

export const WithUnit: Story = {
  args: {
    label: 'Omsetning i dag',
    value: '8 450',
    unit: 'kr',
  },
}

export const Warning: Story = {
  args: {
    label: 'Mangler felt',
    value: 3,
    warn: true,
  },
}

export const Clickable: Story = {
  args: {
    label: 'Skal leveres i dag',
    value: 5,
    warn: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const DashboardRow: Story = {
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      <KpiCard label="Åpne ordrer" value={12} />
      <KpiCard label="Skal leveres i dag" value={5} warn onClick={() => {}} />
      <KpiCard label="Omsetning" value="8 450" unit="kr" />
    </div>
  ),
}
