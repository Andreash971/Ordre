import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronDown, FileDown, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const meta = {
  title: 'UI/ButtonGroup',
  component: ButtonGroup,
} satisfies Meta<typeof ButtonGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Dag</Button>
      <Button variant="outline">Uke</Button>
      <Button variant="outline">Måned</Button>
    </ButtonGroup>
  ),
}

export const SplitButton: Story = {
  render: () => (
    <ButtonGroup>
      <Button>
        <Printer data-icon="inline-start" />
        Skriv ut
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" aria-label="Flere utskriftsvalg">
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <FileDown /> Lagre som PDF
          </DropdownMenuItem>
          <DropdownMenuItem>Skriv ut uten arkivering</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button variant="outline">Øverst</Button>
      <Button variant="outline">Midten</Button>
      <Button variant="outline">Nederst</Button>
    </ButtonGroup>
  ),
}
