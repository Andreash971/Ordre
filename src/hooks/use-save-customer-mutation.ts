import { useMutation, useQueryClient } from '@tanstack/react-query'

import { insertCustomer, updateCustomer } from '@/lib/customer-server-fns'
import { queryKeys } from '@/lib/query-keys'
import type { CustomerFormValues } from '@/lib/order-utils'

/**
 * Insert-or-update a customer (update when `id` is set) and invalidate the
 * customer list on success.
 */
export function useSaveCustomerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      values,
      id,
    }: {
      values: CustomerFormValues
      id: number | null
    }) => {
      if (id != null) {
        await updateCustomer({ data: { id, ...values } })
      } else {
        await insertCustomer({ data: values })
      }
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
  })
}
