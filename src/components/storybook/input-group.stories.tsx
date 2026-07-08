import type { Meta, StoryObj } from '@storybook/react-vite'
import { Phone, Search, X } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'

const meta = {
  title: 'UI/InputGroup',
  component: InputGroup,
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>

export default meta
type Story = StoryObj<typeof meta>

export const WithIcon: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Søk i ordrer …" />
    </InputGroup>
  ),
}

export const WithClearButton: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <Phone />
      </InputGroupAddon>
      <InputGroupInput defaultValue="+47 999 99 999" aria-label="Telefon" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Tøm feltet">
          <X />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithTextSuffix: Story = {
  render: () => (
    <InputGroup>
      <InputGroupInput type="number" defaultValue={890} aria-label="Pris" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>kr</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const WithTextarea: Story = {
  render: () => (
    <InputGroup>
      <InputGroupTextarea
        placeholder="Hilsen på kortet …"
        aria-label="Hilsen"
      />
      <InputGroupAddon align="block-end">
        <InputGroupText className="text-xs">0 / 200 tegn</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  ),
}

export const Invalid: Story = {
  render: () => (
    <InputGroup>
      <InputGroupAddon>
        <Phone />
      </InputGroupAddon>
      <InputGroupInput defaultValue="123" aria-invalid aria-label="Telefon" />
    </InputGroup>
  ),
}
