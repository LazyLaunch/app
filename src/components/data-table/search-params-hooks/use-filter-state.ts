import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { z } from 'zod'

import { columnFiltersSchema } from '@/validations'

import type { ContactFields } from '@/db/models/contact'
import type { ColumnFiltersState } from '@tanstack/react-table'

export function useFilterState({
  columnFilters,
  contactFields,
}: {
  columnFilters: ColumnFiltersState
  contactFields: ContactFields[]
}) {
  const [, setFilter] = useQueryState<ColumnFiltersState>(
    'filter',
    parseAsJson<ColumnFiltersState>(columnFiltersSchema({ z, contactFields }).parse).withDefault([])
  )

  useEffect(() => {
    setFilter(columnFilters)
  }, [columnFilters, setFilter])
}
