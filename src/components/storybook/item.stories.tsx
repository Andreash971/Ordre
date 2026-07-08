import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChevronRight, Flower2, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'

const meta = {
  title: 'UI/Item',
  component: Item,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Item {...args} variant="outline">
      <ItemMedia variant="icon">
        <Flower2 />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Bukett, sesong</ItemTitle>
        <ItemDescription>Bindes med det som er fint i dag.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <span className="text-sm font-medium">450 kr</span>
      </ItemActions>
    </Item>
  ),
}

export const Muted: Story = {
  render: () => (
    <Item variant="muted">
      <ItemMedia variant="icon">
        <User />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Kari Nordmann</ItemTitle>
        <ItemDescription>+47 999 99 999</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="icon-sm" aria-label="Åpne">
          <ChevronRight />
        </Button>
      </ItemActions>
    </Item>
  ),
}

export const Group: Story = {
  render: () => (
    <ItemGroup className="rounded-lg border">
      {['Rose, rød', 'Tulipan, blandet', 'Orkidé'].map((name, i) => (
        <div key={name}>
          {i > 0 && <ItemSeparator />}
          <Item size="sm">
            <ItemContent>
              <ItemTitle>{name}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="xs">
                Legg til
              </Button>
            </ItemActions>
          </Item>
        </div>
      ))}
    </ItemGroup>
  ),
}
