import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const meta = {
  title: 'UI/Select',
  component: Select,
  args: { onValueChange: fn() },
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Velg kategori" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bukett">Bukett</SelectItem>
        <SelectItem value="krans">Krans</SelectItem>
        <SelectItem value="dekorasjon">Dekorasjon</SelectItem>
        <SelectItem value="sorg">Sorgbinderi</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithGroups: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Velg skriver" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Butikk</SelectLabel>
          <SelectItem value="kasse">Kasseskriver</SelectItem>
          <SelectItem value="pakkebord">Pakkebord</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Kontor</SelectLabel>
          <SelectItem value="laser">Laserskriver</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const SmallTrigger: Story = {
  render: (args) => (
    <Select {...args} defaultValue="30">
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10 rader</SelectItem>
        <SelectItem value="30">30 rader</SelectItem>
        <SelectItem value="50">50 rader</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <Select {...args} disabled>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Deaktivert" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">A</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const SelectInteraction: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Velg kategori" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="bukett">Bukett</SelectItem>
        <SelectItem value="krans">Krans</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(canvas.getByRole('combobox'))
    const option = await body.findByRole('option', { name: 'Krans' })
    await userEvent.click(option)
    await waitFor(() =>
      expect(args.onValueChange).toHaveBeenCalledWith('krans'),
    )
  },
}
