import type { Meta, StoryObj } from '@storybook/react-vite'
import { Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'

const meta = {
  title: 'UI/Tooltip',
  component: Tooltip,
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hold over meg</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Forklarende tekst</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
}

/** The app-level convenience wrapper used around icon buttons. */
export const ViaTooltipWrapper: Story = {
  render: () => (
    <TooltipWrapper TooltipText="Skriv ut og arkiver ordren">
      <Button size="icon" variant="outline" aria-label="Skriv ut">
        <Printer />
      </Button>
    </TooltipWrapper>
  ),
}
