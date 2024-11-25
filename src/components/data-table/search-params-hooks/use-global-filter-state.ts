import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { globalFilterSchema } from '@/validations/contacts-page'

import type { GlobalContactColumnFilter } from '@/db/models/contact'

export function useGlobalFilterState(globalFilter: GlobalContactColumnFilter[]) {
  const isDry = useRef<boolean>(true)
  const [, setSearch] = useQueryState<GlobalContactColumnFilter[]>(
    'search',
    parseAsJson<GlobalContactColumnFilter[]>(globalFilterSchema({ z }).parse).withDefault([])
  )

  useEffect(() => {
    if (isDry.current) {
      isDry.current = false
      return
    }
    setSearch(globalFilter)
  }, [globalFilter, setSearch])
}
