import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoreVertical } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const meta = {
  title: 'UI/Card',
  component: Card,
  argTypes: {
    size: { control: 'select', options: ['default', 'sm'] },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Ordre #1042</CardTitle>
        <CardDescription>Levering torsdag 10. juli</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon" aria-label="Flere valg">
            <MoreVertical />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Bukett med sesongblomster til Kari Nordmann, Fjellveien 12. Kort med
          hilsen skal legges ved.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Rediger</Button>
        <Button>Skriv ut</Button>
      </CardFooter>
    </Card>
  ),
}

export const Small: Story = {
  render: (args) => (
    <Card {...args} size="sm" className="w-80">
      <CardHeader>
        <CardTitle>Kompakt kort</CardTitle>
        <CardDescription>Med size=&quot;sm&quot;</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Tettere spacing for lister og paneler.</p>
      </CardContent>
    </Card>
  ),
}
