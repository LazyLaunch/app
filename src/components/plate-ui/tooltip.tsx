import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import * as React from 'react'

export function withTooltip<T extends React.ElementType>(Component: T) {
  return React.forwardRef<
    React.ElementRef<T>,
    {
      tooltip?: React.ReactNode
      tooltipContentProps?: Omit<React.ComponentPropsWithoutRef<typeof TooltipContent>, 'children'>
      tooltipProps?: Omit<React.ComponentPropsWithoutRef<typeof Tooltip>, 'children'>
    } & React.ComponentPropsWithoutRef<T>
  >(function ExtendComponent({ tooltip, tooltipContentProps, tooltipProps, ...props }, ref) {
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    const component = React.createElement(Component, { ref, ...props }) as React.ReactElement

    if (tooltip && mounted) {
      return (
        <TooltipProvider delayDuration={150}>
          <Tooltip {...tooltipProps}>
            <TooltipTrigger asChild>{component}</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent {...tooltipContentProps}>{tooltip}</TooltipContent>
            </TooltipPortal>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return component
  })
}
