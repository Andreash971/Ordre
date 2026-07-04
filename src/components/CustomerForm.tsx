import { useForm, useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import * as z from 'zod'

import {
  BriefcaseBusiness,
  Building2,
  House,
  MapPin,
  Phone,
  User,
  Save,
  UserCheck,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { cn } from '@/lib/utils'
import { TooltipWrapper } from '@/components/ui/tooltip-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'

import AutocompleteField from '@/components/AutocompleteField'
import FormInputField from '@/components/FormInputField'
import type {
  CustomerSuggestion,
  CustomerType,
} from '@/lib/customer-server-fns'
import {
  searchCustomers,
  searchCustomersByBusiness,
  searchCustomersByPhone,
} from '@/lib/customer-server-fns'
import type {
  ContactSuggestion,
  ContactWithCompany,
} from '@/lib/contact-server-fns'
import { searchAllContacts, searchContacts } from '@/lib/contact-server-fns'
import { lookupPostcode, suggestAddresses } from '@/lib/bring-server-fns'
import type { AddressSuggestion } from '@/lib/bring-server-fns'
import { queryKeys } from '@/lib/query-keys'
import type { CustomerFormValues } from '@/lib/order-utils'
import type { CustomerSelection } from '@shared/customers'
import { EMPTY_SELECTION } from '@shared/customers'

/** Submit state handed to the `footer` slot, e.g. for a save button. */
export interface CustomerFormSubmitCtx {
  submit: () => void
  isSubmitting: boolean
  justSaved: boolean
}

interface CustomerFieldsProps {
  className?: string
  defaultValues?: Partial<CustomerFormValues>
  /** Seed for the type tab and the tracked customer/contact ids. */
  defaultSelection?: CustomerSelection
  onValuesChange?: (values: CustomerFormValues) => void
  onSelectionChange?: (selection: CustomerSelection) => void
  onSubmit?: (
    values: CustomerFormValues,
    ctx: { selection: CustomerSelection },
  ) => Promise<void> | void
  /** Rendered after the fields; receives submit state for action buttons. */
  footer?: (ctx: CustomerFormSubmitCtx) => React.ReactNode
}

const formSchema = z.object({
  name: z.string().max(50, 'Navn kan ikke være lengre enn 50 tegn'),
  phone: z.string().max(15, 'Telefonnummer kan ikke være lengre enn 15 tegn'),
  company: z.string().max(50, 'Firma navn kan ikke være lengre enn 50 tegn'),
  address: z.string().max(50, 'Adresse kan ikke være lengre enn 50 tegn'),
  postcode: z.string().max(4, 'Postnummer kan ikke være lengre enn 4 tegn'),
  city: z.string().max(25, 'Sted kan ikke være lengre enn 25 tegn'),
  careof: z.string().max(50, 'C/O person kan ikke være lengre enn 50 tegn'),
})

function CustomerSuggestionItem({
  customer,
}: {
  customer: CustomerSuggestion
}) {
  return (
    <>
      <span className="font-medium">{customer.name}</span>
      {(customer.phone || customer.company) && (
        <span className="text-xs flex gap-1.5 mt-0.5">
          {customer.phone && <span>{customer.phone}</span>}
          {customer.phone && customer.company && <span>|</span>}
          {customer.company && <span>{customer.company}</span>}
        </span>
      )}
    </>
  )
}

/** Suggestion for a business customer: the company is primary. */
function CompanySuggestionItem({ customer }: { customer: CustomerSuggestion }) {
  return (
    <>
      <span className="font-medium">{customer.company || customer.name}</span>
      {(customer.address || customer.city) && (
        <span className="text-xs flex gap-1.5 mt-0.5">
          {customer.address && <span>{customer.address}</span>}
          {customer.address && customer.city && <span>|</span>}
          {customer.city && <span>{customer.city}</span>}
        </span>
      )}
    </>
  )
}

function ContactSuggestionItem({ contact }: { contact: ContactSuggestion }) {
  return (
    <>
      <span className="font-medium">{contact.name}</span>
      {contact.phone && (
        <span className="text-xs flex gap-1.5 mt-0.5">{contact.phone}</span>
      )}
    </>
  )
}

/** A representative found across all companies: shows which firm they belong to. */
function ContactWithCompanySuggestionItem({
  contact,
}: {
  contact: ContactWithCompany
}) {
  return (
    <>
      <span className="font-medium">{contact.name}</span>
      <span className="text-xs flex gap-1.5 mt-0.5">
        <span>{contact.company.company || contact.company.name}</span>
        {contact.phone && (
          <>
            <span>|</span>
            <span>{contact.phone}</span>
          </>
        )}
      </span>
    </>
  )
}

function formatAddress(address: AddressSuggestion) {
  return `${address.street_name}${address.house_number != null ? ` ${address.house_number}` : ''}${address.letter ?? ''}`
}

function AddressSuggestionItem({ address }: { address: AddressSuggestion }) {
  return (
    <>
      <span className="font-medium">{formatAddress(address)}</span>
      <span className="text-xs flex gap-1.5 mt-0.5">
        <span>{`${address.postal_code} ${address.city}`}</span>
        {address.municipality && (
          <>
            <span>|</span>
            <span>{address.municipality}</span>
          </>
        )}
      </span>
    </>
  )
}

/**
 * The pure customer form: Privat/Firma type tab, fields, validation,
 * customer/address autocomplete, and postcode→city lookup — no card chrome.
 * Compose the chrome at the call site (see CustomerFormCard) and pass a
 * `footer` for action buttons.
 *
 * Both types share the same flat field values; only the field order and
 * which records a save targets differ. In business mode the company field
 * tracks the company row and the name field is the representative, tracked
 * as a contact under that company.
 */
export function CustomerFields({
  className,
  defaultValues: initialValues,
  defaultSelection,
  onValuesChange,
  onSelectionChange,
  onSubmit,
  footer,
}: CustomerFieldsProps) {
  const formId = useId()
  const [selection, setSelectionState] = useState<CustomerSelection>(
    defaultSelection ?? EMPTY_SELECTION,
  )
  const selectionRef = useRef(selection)
  /** Name of the currently selected contact; typing a different name means
   * "new representative", so the tracked contact id is dropped. */
  const selectedContactNameRef = useRef<string | null>(null)
  const onSelectionChangeRef = useRef(onSelectionChange)
  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
  }, [onSelectionChange])
  const setSelection = (patch: Partial<CustomerSelection>) => {
    const prev = selectionRef.current
    const next = { ...prev, ...patch }
    if (
      prev.type === next.type &&
      prev.customerId === next.customerId &&
      prev.contactId === next.contactId
    )
      return
    selectionRef.current = next
    setSelectionState(next)
    onSelectionChangeRef.current?.(next)
  }
  const [justSaved, setJustSaved] = useState(false)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    },
    [],
  )

  const form = useForm({
    defaultValues: {
      name: initialValues?.name ?? '',
      phone: initialValues?.phone ?? '',
      company: initialValues?.company ?? '',
      address: initialValues?.address ?? '',
      postcode: initialValues?.postcode ?? '',
      city: initialValues?.city ?? '',
      careof: initialValues?.careof ?? '',
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    listeners: {
      onChange: ({ formApi }) => {
        const values = formApi.state.values
        if (selectionRef.current.type === 'private') {
          if (!values.name) {
            setSelection({ customerId: null })
          }
        } else {
          if (!values.company) {
            selectedContactNameRef.current = null
            setSelection({ customerId: null, contactId: null })
          } else if (
            selectionRef.current.contactId != null &&
            values.name !== selectedContactNameRef.current
          ) {
            selectedContactNameRef.current = null
            setSelection({ contactId: null })
          }
        }
        onValuesChange?.(values)
      },
    },
    onSubmit: async ({ value }) => {
      if (!onSubmit) return
      await onSubmit(value, { selection: selectionRef.current })
      setJustSaved(true)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setJustSaved(false), 2000)
    },
  })

  const postcode = useStore(form.store, (s) => s.values.postcode)
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting)

  const { data: bringLookup } = useQuery({
    queryKey: queryKeys.bring.postcode(postcode),
    queryFn: () => lookupPostcode({ data: postcode }),
    enabled: /^\d{4}$/.test(postcode),
    staleTime: Infinity,
  })

  useEffect(() => {
    if (bringLookup?.city) {
      form.setFieldValue('city', bringLookup.city)
    }
  }, [bringLookup?.city])

  const type = selection.type
  const isBusiness = type === 'business'

  const switchType = (next: CustomerType) => {
    if (next === type) return
    selectedContactNameRef.current = null
    setSelection({ type: next, customerId: null, contactId: null })
  }

  /** Private mode: a saved customer fills the whole form. */
  const fillFromCustomer = (customer: CustomerSuggestion) => {
    selectedContactNameRef.current = null
    setSelection({ customerId: customer.id, contactId: null })
    form.setFieldValue('name', customer.name)
    form.setFieldValue('phone', customer.phone ?? '')
    form.setFieldValue('company', customer.company ?? '')
    form.setFieldValue('address', customer.address ?? '')
    form.setFieldValue('postcode', customer.postcode ?? '')
    form.setFieldValue('city', customer.city ?? '')
    form.setFieldValue('careof', customer.careof ?? '')
  }

  /** Business mode: a company fills its own fields and resets the contact. */
  const fillFromCompany = (customer: CustomerSuggestion) => {
    selectedContactNameRef.current = null
    setSelection({ customerId: customer.id, contactId: null })
    form.setFieldValue('company', customer.company ?? customer.name)
    form.setFieldValue('address', customer.address ?? '')
    form.setFieldValue('postcode', customer.postcode ?? '')
    form.setFieldValue('city', customer.city ?? '')
    form.setFieldValue('name', '')
    form.setFieldValue('phone', '')
    form.setFieldValue('careof', '')
  }

  const fillFromContact = (contact: ContactSuggestion) => {
    selectedContactNameRef.current = contact.name
    setSelection({ contactId: contact.id })
    form.setFieldValue('name', contact.name)
    form.setFieldValue('phone', contact.phone ?? '')
    form.setFieldValue('careof', contact.careof ?? '')
  }

  /** Representative picked across all companies: fills their firm too. */
  const fillFromContactWithCompany = (contact: ContactWithCompany) => {
    selectedContactNameRef.current = contact.name
    setSelection({ customerId: contact.customerId, contactId: contact.id })
    form.setFieldValue(
      'company',
      contact.company.company ?? contact.company.name,
    )
    form.setFieldValue('address', contact.company.address ?? '')
    form.setFieldValue('postcode', contact.company.postcode ?? '')
    form.setFieldValue('city', contact.company.city ?? '')
    form.setFieldValue('name', contact.name)
    form.setFieldValue('phone', contact.phone ?? '')
    form.setFieldValue('careof', contact.careof ?? '')
  }

  const nameField = (
    <form.Field name="name">
      {(field) =>
        isBusiness && selection.customerId == null ? (
          // No company chosen yet: search representatives across all
          // companies — picking one selects their firm as well.
          <AutocompleteField
            field={field}
            id={`${formId}-name`}
            icon={<User className="text-foreground" />}
            placeholder="Representant"
            autoComplete="off"
            searchKey="contacts-search-all"
            onSearch={(q) => searchAllContacts({ data: q })}
            onSelect={fillFromContactWithCompany}
            renderSuggestion={(c) => (
              <ContactWithCompanySuggestionItem contact={c} />
            )}
          />
        ) : isBusiness ? (
          // Company chosen: a dropdown of its representatives — focusing the
          // field lists them all before any typing.
          <AutocompleteField
            field={field}
            id={`${formId}-name`}
            icon={<User className="text-foreground" />}
            placeholder="Representant"
            autoComplete="off"
            minChars={0}
            searchKey={`contacts-search-${selection.customerId}`}
            onSearch={(q) => {
              const companyId = selectionRef.current.customerId
              if (companyId == null) return Promise.resolve([])
              return searchContacts({
                data: { customerId: companyId, query: q },
              })
            }}
            onSelect={fillFromContact}
            renderSuggestion={(c) => <ContactSuggestionItem contact={c} />}
          />
        ) : (
          <AutocompleteField
            field={field}
            id={`${formId}-name`}
            icon={<User className="text-foreground" />}
            placeholder="Navn"
            autoComplete="name"
            searchKey="customers-private-name"
            onSearch={(q) =>
              searchCustomers({ data: { query: q, type: 'private' } })
            }
            onSelect={fillFromCustomer}
            renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
          />
        )
      }
    </form.Field>
  )

  const phoneField = (
    <form.Field name="phone">
      {(field) =>
        isBusiness ? (
          <FormInputField
            field={field}
            id={`${formId}-phone`}
            icon={<Phone className="text-foreground" />}
            placeholder="Telefon"
            type="tel"
            autoComplete="tel"
          />
        ) : (
          <AutocompleteField
            field={field}
            id={`${formId}-phone`}
            icon={<Phone className="text-foreground" />}
            placeholder="Telefon"
            type="tel"
            autoComplete="tel"
            searchKey="customers-private-phone"
            onSearch={(q) =>
              searchCustomersByPhone({ data: { query: q, type: 'private' } })
            }
            onSelect={fillFromCustomer}
            renderSuggestion={(c) => <CustomerSuggestionItem customer={c} />}
          />
        )
      }
    </form.Field>
  )

  const companyField = (
    <form.Field name="company">
      {(field) => (
        <AutocompleteField
          field={field}
          id={`${formId}-company`}
          icon={<BriefcaseBusiness className="text-foreground" />}
          placeholder="Firma"
          autoComplete="organization"
          searchKey={`customers-${type}-company`}
          onSearch={(q) =>
            searchCustomersByBusiness({ data: { query: q, type } })
          }
          onSelect={isBusiness ? fillFromCompany : fillFromCustomer}
          renderSuggestion={(c) =>
            isBusiness ? (
              <CompanySuggestionItem customer={c} />
            ) : (
              <CustomerSuggestionItem customer={c} />
            )
          }
        />
      )}
    </form.Field>
  )

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ButtonGroup className="w-full">
        <Button
          type="button"
          size="sm"
          variant={isBusiness ? 'outline' : 'default'}
          className="flex-1"
          onClick={() => switchType('private')}
        >
          <User />
          Privat
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isBusiness ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => switchType('business')}
        >
          <Building2 />
          Firma
        </Button>
      </ButtonGroup>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup className="flex flex-col gap-4">
          {isBusiness ? (
            <>
              {companyField}
              {nameField}
              {phoneField}
            </>
          ) : (
            <>
              {nameField}
              {phoneField}
              {companyField}
            </>
          )}

          <form.Field name="address">
            {(field) => (
              <AutocompleteField
                field={field}
                id={`${formId}-address`}
                icon={<House className="text-foreground" />}
                placeholder="Adresse"
                autoComplete="street-address"
                onSearch={(q) => suggestAddresses({ data: q })}
                onSelect={(a) => {
                  form.setFieldValue('address', formatAddress(a))
                  form.setFieldValue('postcode', a.postal_code)
                  form.setFieldValue('city', a.city)
                }}
                renderSuggestion={(a) => <AddressSuggestionItem address={a} />}
              />
            )}
          </form.Field>

          <div className="grid grid-cols-[minmax(6rem,1fr)_minmax(6rem,2fr)] gap-4">
            <form.Field name="postcode">
              {(field) => (
                <FormInputField
                  field={field}
                  id={`${formId}-postcode`}
                  icon={<MapPin className="text-foreground" />}
                  placeholder="Postnr."
                  type="number"
                  autoComplete="postal-code"
                />
              )}
            </form.Field>

            <form.Field name="city">
              {(field) => (
                <FormInputField
                  field={field}
                  id={`${formId}-city`}
                  icon={<Building2 className="text-foreground" />}
                  placeholder="Sted"
                  autoComplete="address-level2"
                />
              )}
            </form.Field>
          </div>

          <form.Field name="careof">
            {(field) => (
              <FormInputField
                field={field}
                id={`${formId}-careof`}
                icon={<UserCheck className="text-foreground" />}
                placeholder="C/O"
                autoComplete="off"
              />
            )}
          </form.Field>
        </FieldGroup>
      </form>
      {footer?.({
        submit: () => form.handleSubmit(),
        isSubmitting,
        justSaved,
      })}
    </div>
  )
}

/** The standard save button for CustomerFields' `footer` slot. */
export function SaveCustomerButton({
  submit,
  isSubmitting,
  justSaved,
}: CustomerFormSubmitCtx) {
  return (
    <TooltipWrapper TooltipText="Lagre kundens informasjon i systemet">
      <Button
        type="submit"
        disabled={isSubmitting}
        onClick={(e) => {
          e.preventDefault()
          submit()
        }}
        className={cn(
          'transition-colors',
          justSaved &&
            'bg-green-600 text-white hover:bg-green-600 focus-visible:ring-green-600',
        )}
      >
        {justSaved ? (
          <>
            <Check className="h-4 w-4" />
            Lagret
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Lagre
          </>
        )}
      </Button>
    </TooltipWrapper>
  )
}

const saveFooter = (ctx: CustomerFormSubmitCtx) => (
  <div className="flex justify-end gap-2">
    <SaveCustomerButton {...ctx} />
  </div>
)

/** CustomerFields wrapped in card chrome, with an optional save button. */
export function CustomerFormCard({
  showSaveButton = true,
  ...fields
}: Omit<CustomerFieldsProps, 'footer'> & { showSaveButton?: boolean }) {
  return (
    <Card className="min-w-60">
      <CardContent>
        <CustomerFields
          {...fields}
          footer={showSaveButton ? saveFooter : undefined}
        />
      </CardContent>
    </Card>
  )
}
