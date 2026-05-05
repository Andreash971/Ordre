import type {
  Product,
  InsertProductInput,
  UpdateProductInput,
} from './api-types'

export type { Product, InsertProductInput, UpdateProductInput }

const api = () => window.electronAPI.products

export const getAllProducts = (): Promise<Array<Product>> => api().getAll()

export const searchProducts = ({
  data,
}: {
  data: string
}): Promise<Array<Product>> => api().search(data)

export const deleteProduct = ({ data }: { data: number }): Promise<void> =>
  api().delete(data)

export const insertProduct = ({
  data,
}: {
  data: InsertProductInput
}): Promise<Product> => api().insert(data)

export const updateProduct = ({
  data,
}: {
  data: UpdateProductInput
}): Promise<void> => api().update(data)
