import { Plus } from 'lucide-react'
import { useState } from 'react'

import type { ProjectFormResponseData } from '@/components/project/NewProjectForm'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Button } from '@/components/ui/button'

import { NewProjectForm } from '@/components/project/NewProjectForm'

interface Props {
  csrfToken: string
  teamId: string
  addProject: (data: ProjectFormResponseData) => void
}

export function AddBtnProjectComponent({ csrfToken, teamId, addProject }: Props) {
  const [openNewProject, setOpenProject] = useState(false)
  const [openNewMember, setOpenMember] = useState(false)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpenProject((prevState) => !prevState)}
        >
          Project
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setOpenMember((prevState) => !prevState)}
        >
          Team Member
        </DropdownMenuItem>
      </DropdownMenuContent>
      <Dialog open={openNewProject} onOpenChange={setOpenProject}>
        <DialogContent className="max-w-xl p-0">
          <NewProjectForm
            setOpenProject={setOpenProject}
            csrfToken={csrfToken}
            addProject={addProject}
            teamId={teamId}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openNewMember} onOpenChange={setOpenMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add new member</DialogTitle>
            <DialogDescription>Add new member</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit">Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}
