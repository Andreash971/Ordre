import type { ArchivedOrder, NewArchivedOrder } from '@shared/orders'

export type { ArchivedOrder, NewArchivedOrder }

const api = () => window.electronAPI.orders

export const getAllOrders = (): Promise<Array<ArchivedOrder>> => api().getAll()

export const insertOrders = ({
  data,
}: {
  data: Array<NewArchivedOrder>
}): Promise<void> => api().insert(data)

export const deleteOrder = ({ data }: { data: string }): Promise<void> =>
  api().delete(data)

export const clearOrders = (): Promise<void> => api().clear()
