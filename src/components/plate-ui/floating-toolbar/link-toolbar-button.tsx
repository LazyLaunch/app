import { withRef } from '@udecode/cn'
import { useLinkToolbarButton, useLinkToolbarButtonState } from '@udecode/plate-link/react'
import { Link } from 'lucide-react'

import { ToolbarButton } from '@/components/plate-ui/toolbar'

export const LinkToolbarButton = withRef<typeof ToolbarButton>((rest, ref) => {
  const state = useLinkToolbarButtonState()
  const { props } = useLinkToolbarButton(state)

  return (
    <ToolbarButton
      ref={ref}
      variant="ghost"
      size="iconXs"
      tooltip="Insert link"
      {...props}
      {...rest}
    >
      <Link className="size-4" />
    </ToolbarButton>
  )
})
