import { Plus } from 'lucide-react'

import { GroupForm } from '@/components/groups/group-form'
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

export function NewGroupBtn(props: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <GroupForm {...props} />
      </DialogContent>
    </Dialog>
  )
}
