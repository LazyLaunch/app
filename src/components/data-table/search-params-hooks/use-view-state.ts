import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect, useRef } from 'react'
import { z } from 'zod'

import { viewItemSchema } from '@/validations/contacts-page'

import type { ContactFields } from '@/db/models/contact'
import type { VisibilityState } from '@tanstack/react-table'

export function useViewState({
  contactFields,
  columnVisibility,
}: { contactFields: ContactFields[]; columnVisibility: VisibilityState }) {
  const isDry = useRef<boolean>(true)
  const [, setView] = useQueryState<VisibilityState>(
    'view',
    parseAsJson<VisibilityState>(viewItemSchema({ z, contactFields }).parse).withDefault({})
  )

  useEffect(() => {
    if (isDry.current) {
      isDry.current = false
      return
    }
    setView(columnVisibility)
  }, [columnVisibility, setView])
}
