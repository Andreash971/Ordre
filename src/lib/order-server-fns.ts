import type {
  ArchivedOrder,
  NewArchivedOrder,
  UpdatedArchivedOrder,
} from '@shared/orders'

export type { ArchivedOrder, NewArchivedOrder, UpdatedArchivedOrder }

const api = () => window.electronAPI.orders

export const getAllOrders = (): Promise<Array<ArchivedOrder>> => api().getAll()

export const insertOrders = ({
  data,
}: {
  data: Array<NewArchivedOrder>
}): Promise<void> => api().insert(data)

export const updateOrder = ({
  data,
}: {
  data: UpdatedArchivedOrder
}): Promise<ArchivedOrder | null> => api().update(data)

export const deleteOrder = ({ data }: { data: string }): Promise<void> =>
  api().delete(data)

export const clearOrders = (): Promise<void> => api().clear()
