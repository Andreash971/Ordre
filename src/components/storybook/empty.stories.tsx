import type { Meta, StoryObj } from '@storybook/react-vite'
import { Inbox, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

const meta = {
  title: 'UI/Empty',
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty className="w-96 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>Ingen åpne ordrer</EmptyTitle>
        <EmptyDescription>
          Nye ordrer dukker opp her når de registreres.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Ny ordre</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const WithoutAction: Story = {
  render: () => (
    <Empty className="w-96">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>Ingen kunder funnet</EmptyTitle>
        <EmptyDescription>Prøv et annet søk.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
}
