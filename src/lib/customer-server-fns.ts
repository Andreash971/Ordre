import type {
  Customer,
  CustomerSuggestion,
  CustomerType,
  InsertCustomerInput,
  UpdateCustomerInput,
} from '@shared/customers'

export type {
  Customer,
  CustomerSuggestion,
  CustomerType,
  InsertCustomerInput,
  UpdateCustomerInput,
}

export type CustomerSearchQuery = { query: string; type: CustomerType }

const api = () => window.electronAPI.customers

export const getAllCustomers = (): Promise<Array<Customer>> => api().getAll()

export const searchCustomers = ({
  data,
}: {
  data: CustomerSearchQuery
}): Promise<Array<CustomerSuggestion>> => api().search(data.query, data.type)

export const searchCustomersByPhone = ({
  data,
}: {
  data: CustomerSearchQuery
}): Promise<Array<CustomerSuggestion>> =>
  api().searchByPhone(data.query, data.type)

export const searchCustomersByBusiness = ({
  data,
}: {
  data: CustomerSearchQuery
}): Promise<Array<CustomerSuggestion>> =>
  api().searchByBusiness(data.query, data.type)

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
