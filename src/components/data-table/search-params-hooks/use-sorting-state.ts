import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { z } from 'zod'

import { sortingSchema } from '@/validations'

import type { ContactFields } from '@/db/models/contact'
import type { SortingState } from '@tanstack/react-table'

export function useSortingState({
  sorting,
  contactFields,
}: {
  contactFields: ContactFields[]
  sorting: SortingState
}) {
  const [, setSorting] = useQueryState<SortingState>(
    'sort',
    parseAsJson<SortingState>(sortingSchema({ z, contactFields }).parse).withDefault([
      { id: 'createdAt', desc: true },
    ])
  )

  useEffect(() => {
    setSorting(sorting)
  }, [sorting, setSorting])
}
