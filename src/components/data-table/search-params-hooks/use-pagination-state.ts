import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect } from 'react'

import { paginationPageStateParser } from '@/lib/parsers'

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constants'

export function usePaginationState({
  pageIndex,
  pageSize,
}: { pageIndex: number; pageSize: number }) {
  const [, setPage] = useQueryState(
    'page',
    paginationPageStateParser().withDefault(DEFAULT_PAGE_INDEX)
  )
  const [, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(DEFAULT_PAGE_SIZE))

  useEffect(() => {
    setPage(pageIndex)
  }, [pageIndex, setPage])

  useEffect(() => {
    setPageSize(pageSize)
  }, [pageSize, setPageSize])
}
