import {
  useMarkToolbarButton,
  useMarkToolbarButtonState,
  withRef,
} from '@udecode/plate-common/react'

import { ToolbarButton } from '@/components/plate-ui/toolbar'

export const MarkToolbarButton = withRef<
  typeof ToolbarButton,
  {
    clear?: string | string[]
    nodeType: string
  }
>(({ clear, nodeType, ...rest }, ref) => {
  const state = useMarkToolbarButtonState({ clear, nodeType })
  const { props } = useMarkToolbarButton(state)

  return <ToolbarButton variant="ghost" size="iconXs" ref={ref} {...props} {...rest} />
})
