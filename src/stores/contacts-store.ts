import { atom } from 'nanostores'

import type { ContactProps } from '@/db/models/contact'

export const $contacts = atom<ContactProps[] | undefined>(undefined)

export function $addContact(data: ContactProps[], contact: ContactProps) {
  $contacts.set([...data, contact])
}

export function $deleteContact(data: ContactProps[], { id }: { id: string }) {
  const newData = data?.filter((d) => d.id !== id)
  $contacts.set(newData)
}
