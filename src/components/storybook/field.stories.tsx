import type { Meta, StoryObj } from '@storybook/react-vite'

import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const meta = {
  title: 'UI/Field',
  component: Field,
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="name">Mottakers navn</FieldLabel>
      <Input id="name" placeholder="Kari Nordmann" />
      <FieldDescription>Navnet som skrives på kortet.</FieldDescription>
    </Field>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="ring">Ring før levering</FieldLabel>
      <Switch id="ring" />
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="phone-err">Telefon</FieldLabel>
      <Input id="phone-err" defaultValue="123" aria-invalid />
      <FieldError>Telefonnummeret må ha 8 siffer.</FieldError>
    </Field>
  ),
}

export const FieldSetComposition: Story = {
  render: () => (
    <FieldSet>
      <FieldLegend>Levering</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="addr">Adresse</FieldLabel>
          <Input id="addr" placeholder="Fjellveien 12" />
        </Field>
        <Field>
          <FieldLabel htmlFor="city">Poststed</FieldLabel>
          <Input id="city" placeholder="Bergen" />
        </Field>
        <FieldSeparator>Valg</FieldSeparator>
        <Field orientation="horizontal">
          <Checkbox id="leave" />
          <FieldLabel htmlFor="leave">Kan settes igjen på døren</FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
}
