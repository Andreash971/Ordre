import type {
  Customer,
  CustomerSuggestion,
  InsertCustomerInput,
  UpdateCustomerInput,
} from '@shared/customers'

export type {
  Customer,
  CustomerSuggestion,
  InsertCustomerInput,
  UpdateCustomerInput,
}

const api = () => window.electronAPI.customers

export const getAllCustomers = (): Promise<Array<Customer>> => api().getAll()

export const searchCustomers = ({
  data,
}: {
  data: string
}): Promise<Array<CustomerSuggestion>> => api().search(data)

export const searchCustomersByPhone = ({
  data,
}: {
  data: string
}): Promise<Array<CustomerSuggestion>> => api().searchByPhone(data)

export const searchCustomersByBusiness = ({
  data,
}: {
  data: string
}): Promise<Array<CustomerSuggestion>> => api().searchByBusiness(data)

export const deleteCustomer = ({ data }: { data: number }): Promise<void> =>
  api().delete(data)

export const insertCustomer = ({
  data,
}: {
  data: InsertCustomerInput
}): Promise<{ id: number }> => api().insert(data)

export const updateCustomer = ({
  data,
}: {
  data: UpdateCustomerInput
}): Promise<void> => api().update(data)
