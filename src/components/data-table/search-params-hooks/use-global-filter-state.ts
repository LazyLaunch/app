import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { z } from 'zod'

import { globalFilterSchema } from '@/validations'

import type { GlobalContactColumnFilter } from '@/db/models/contact'

export function useGlobalFilterState(globalFilter: GlobalContactColumnFilter[]) {
  const [, setSearch] = useQueryState<GlobalContactColumnFilter[]>(
    'search',
    parseAsJson<GlobalContactColumnFilter[]>(globalFilterSchema({ z }).parse).withDefault([])
  )

  useEffect(() => {
    setSearch(globalFilter)
  }, [globalFilter, setSearch])
}
