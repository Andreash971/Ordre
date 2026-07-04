import { useMutation, useQueryClient } from '@tanstack/react-query'

import { insertCustomer, updateCustomer } from '@/lib/customer-server-fns'
import { insertContact, updateContact } from '@/lib/contact-server-fns'
import { queryKeys } from '@/lib/query-keys'
import type { CustomerFormValues } from '@/lib/order-utils'
import type { CustomerSelection } from '@shared/customers'

/**
 * Insert-or-update the customer a form has resolved to and invalidate the
 * affected lists on success.
 *
 * Private: one row, updated when `selection.customerId` is set. Business:
 * upsert the company row (the flat form's company/address fields), then
 * upsert the representative (name/phone/careof) as a contact under it.
 */
export function useSaveCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      values,
      selection,
    }: {
      values: CustomerFormValues
      selection: CustomerSelection
    }) => {
      if (selection.type === 'business') {
        // Nothing to target without a company: skip instead of inserting an
        // unnamed company row.
        if (selection.customerId == null && !values.company) return
        const company = {
          type: 'business' as const,
          name: values.company,
          company: values.company,
          address: values.address,
          postcode: values.postcode,
          city: values.city,
          phone: '',
          careof: '',
        }
        let companyId = selection.customerId
        if (companyId != null) {
          await updateCustomer({ data: { id: companyId, ...company } })
        } else {
          companyId = (await insertCustomer({ data: company })).id
        }
        if (values.name) {
          const contact = {
            customerId: companyId,
            name: values.name,
            phone: values.phone,
            careof: values.careof,
          }
          if (selection.contactId != null) {
            await updateContact({
              data: { id: selection.contactId, ...contact },
            })
          } else {
            await insertContact({ data: contact })
          }
        }
        return
      }

      const data = { ...values, type: 'private' as const }
      if (selection.customerId != null) {
        await updateCustomer({ data: { id: selection.customerId, ...data } })
      } else {
        await insertCustomer({ data })
      }
    },
    onSuccess: (_data, { selection }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all })
      if (selection.type === 'business') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all })
      }
    },
  })
}
