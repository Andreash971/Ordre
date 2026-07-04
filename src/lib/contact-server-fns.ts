import type {
  Contact,
  ContactSearchInput,
  ContactSuggestion,
  ContactWithCompany,
  InsertContactInput,
  UpdateContactInput,
} from '@shared/contacts'

export type {
  Contact,
  ContactSearchInput,
  ContactSuggestion,
  ContactWithCompany,
  InsertContactInput,
  UpdateContactInput,
}

const api = () => window.electronAPI.contacts

export const getAllContacts = (): Promise<Array<Contact>> => api().getAll()

export const getContactsByCompany = ({
  data,
}: {
  data: number
}): Promise<Array<Contact>> => api().getByCompany(data)

export const searchContacts = ({
  data,
}: {
  data: ContactSearchInput
}): Promise<Array<ContactSuggestion>> => api().search(data)

export const searchAllContacts = ({
  data,
}: {
  data: string
}): Promise<Array<ContactWithCompany>> => api().searchAll(data)

export const insertContact = ({
  data,
}: {
  data: InsertContactInput
}): Promise<{ id: number }> => api().insert(data)

export const updateContact = ({
  data,
}: {
  data: UpdateContactInput
}): Promise<void> => api().update(data)

export const deleteContact = ({ data }: { data: number }): Promise<void> =>
  api().delete(data)
