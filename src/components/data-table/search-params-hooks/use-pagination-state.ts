import { parseAsInteger, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'

import { paginationPageStateParser } from '@/parsers/contacts-page'

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constants'

export function usePaginationState({
  pageIndex,
  pageSize,
}: { pageIndex: number; pageSize: number }) {
  const isPageDry = useRef<boolean>(true)
  const isPageSizeDry = useRef<boolean>(true)
  const [, setPage] = useQueryState(
    'page',
    paginationPageStateParser().withDefault(DEFAULT_PAGE_INDEX)
  )
  const [, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(DEFAULT_PAGE_SIZE))

  useEffect(() => {
    if (isPageDry.current) {
      isPageDry.current = false
      return
    }
    setPage(pageIndex)
  }, [pageIndex, setPage])

  useEffect(() => {
    if (isPageSizeDry.current) {
      isPageSizeDry.current = false
      return
    }
    setPageSize(pageSize)
  }, [pageSize, setPageSize])
}
