import { parseAsJson, useQueryState } from 'nuqs'
import { useEffect } from 'react'
import { z } from 'zod'

import { viewItemSchema } from '@/validations/contacts-page'

import type { ContactFields } from '@/db/models/contact'
import type { VisibilityState } from '@tanstack/react-table'

export function useViewState({
  contactFields,
  columnVisibility,
}: { contactFields: ContactFields[]; columnVisibility: VisibilityState }) {
  const [, setView] = useQueryState<VisibilityState>(
    'view',
    parseAsJson<VisibilityState>(viewItemSchema({ z, contactFields }).parse).withDefault({})
  )

  useEffect(() => {
    setView(columnVisibility)
  }, [columnVisibility, setView])
}
