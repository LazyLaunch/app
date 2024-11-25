import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { sortingSchema } from '@/validations/contacts-page'

import type { ContactFields } from '@/db/models/contact'
import type { SortingState } from '@tanstack/react-table'

export function useSortingState({
  sorting,
  contactFields,
}: {
  contactFields: ContactFields[]
  sorting: SortingState
}) {
  const isDry = useRef<boolean>(true)
  const [, setSorting] = useQueryState<SortingState>(
    'sort',
    parseAsJson<SortingState>(sortingSchema({ z, contactFields }).parse).withDefault([
      { id: 'createdAt', desc: true },
    ])
  )

  useEffect(() => {
    if (isDry.current) {
      isDry.current = false
      return
    }
    setSorting(sorting)
  }, [sorting, setSorting])
}
