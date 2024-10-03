import { Check, ExternalLink, Link, Merge, Trash, X } from 'lucide-react'
import React, { useState } from 'react'

import { cn } from '@udecode/cn'
import { useEditorPlugin } from '@udecode/plate-common/react'
import { flip, offset, type UseVirtualFloatingOptions } from '@udecode/plate-floating'
import { validateUrl } from '@udecode/plate-link'
import {
  LinkOpenButton,
  LinkPlugin,
  submitFloatingLink,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
  useFloatingLinkUrlInput,
  useFloatingLinkUrlInputState,
  type LinkFloatingToolbarState,
} from '@udecode/plate-link/react'

import { withTooltip } from '@/components/plate-ui/tooltip'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { buildUrl } from '@/lib/build-url'

export interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState
}

const floatingOptions: UseVirtualFloatingOptions = {
  middleware: [
    offset(10),
    flip({
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
      padding: 10,
    }),
  ],
  placement: 'bottom-start',
}

const BtnAction = withTooltip(
  React.forwardRef<React.ElementRef<typeof Button>, React.ComponentPropsWithoutRef<typeof Button>>(
    ({ children, className, ...props }, ref) => {
      return (
        <Button variant="ghost" size="iconXs" className={className} {...props} ref={ref}>
          {children}
        </Button>
      )
    }
  )
)

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
  const { api, getOptions } = useEditorPlugin(LinkPlugin)
  const [isValidUrl, setValidUrl] = useState<undefined | boolean>(undefined)

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const { hidden, props: insertProps, ref: insertRef } = useFloatingLinkInsert(insertState)

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  })
  const { editor } = editState
  const {
    editButtonProps,
    props: editProps,
    ref: editRef,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState)

  const floatingLinkUrlState = useFloatingLinkUrlInputState()
  const floatingLinkUrlProps = useFloatingLinkUrlInput(floatingLinkUrlState)

  if (hidden) return null

  const input = (
    <div className="relative flex w-full">
      <Link className="absolute left-2 top-2 size-4 text-foreground" />
      <Input
        className="h-8 border-0 pl-7 pr-20 focus-visible:ring-0"
        placeholder="Past or type a link"
        ref={floatingLinkUrlProps.ref}
        defaultValue={floatingLinkUrlProps.props.defaultValue}
        onChange={(e) => {
          const val = e.target.value
          const url = buildUrl(val)
          e.target.value = url
          const isValid = validateUrl(editor, url)
          setValidUrl(isValid)
          floatingLinkUrlProps.props.onChange(e)
        }}
      />
      <BtnAction
        onClick={(e) => {
          e.preventDefault()
          api.floatingLink.hide()
        }}
        className="absolute right-14 top-1"
        tooltip="Close (ESC)"
      >
        <X className="size-4 text-foreground" />
      </BtnAction>
      <BtnAction className="absolute right-8 top-1" tooltip="Insert contact property">
        <Merge className="size-4 text-foreground" />
      </BtnAction>
      <BtnAction
        disabled={typeof isValidUrl === 'undefined'}
        className="absolute right-2 top-1"
        onClick={() => submitFloatingLink(editor)}
        tooltip={
          (isValidUrl && 'Save and close') ||
          (!isValidUrl && (
            <>
              Invalid URL. Ensure the URL starts with <b>https://</b>
              <br />
              and ends with a valid domain like <b>.com</b>
            </>
          ))
        }
      >
        <Check
          className={cn('size-4 text-foreground', isValidUrl === false && 'text-destructive')}
        />
      </BtnAction>
    </div>
  )

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="relative flex w-full p-1">
      <Button size="xs" variant="ghost" {...editButtonProps}>
        Edit link
      </Button>

      <BtnAction asChild tooltip="Open link">
        <LinkOpenButton>
          <ExternalLink className="size-4" />
        </LinkOpenButton>
      </BtnAction>

      <BtnAction tooltip="Remove link" {...unlinkButtonProps}>
        <Trash className="size-4" />
      </BtnAction>
    </div>
  )
  const { mode } = getOptions()
  const isInsertMode = mode === 'insert'
  const cardProps = isInsertMode
    ? {
        ref: insertRef,
        ...insertProps,
      }
    : {
        ref: editRef,
        ...editProps,
      }

  return (
    <Card className="p-1" {...cardProps}>
      {isInsertMode ? input : editContent}
    </Card>
  )
}
