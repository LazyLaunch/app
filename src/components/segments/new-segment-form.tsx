import { Plus } from 'lucide-react'

import { SegmentForm } from '@/components/segments/segment-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

import type { SelectFilter } from '@/db/schema'
import type { Row } from '@tanstack/react-table'

interface Props {
  csrfToken: string
  row?: Row<SelectFilter>
  ids: {
    projectId: string
    teamId: string
  }
}

export function NewSegmentForm(props: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add segment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <SegmentForm {...props} />
      </DialogContent>
    </Dialog>
  )
}
