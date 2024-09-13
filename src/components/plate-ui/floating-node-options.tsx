import { cn } from '@udecode/cn'
import { SlidersHorizontal } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useEffect, useRef } from 'react'

function useClickOutside(ref: React.RefObject<HTMLDivElement>, handler: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClickOutside, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [ref, handler])
}

interface Props {
  setIsHovered: (isOpen: boolean) => void
  setFloatingOptionsOpen: (isOpen: boolean) => void
  isFloatingOptionsOpen: boolean
}

export function FloatingNodeOptions({
  setIsHovered,
  setFloatingOptionsOpen,
  isFloatingOptionsOpen,
}: Props) {
  const floatingSectionRef = useRef<HTMLDivElement>(null)
  const onClickOutside = () => {
    setIsHovered(false)
    setFloatingOptionsOpen(false)
  }

  useClickOutside(floatingSectionRef, onClickOutside)

  return (
    <Popover>
      <TooltipProvider delayDuration={150}>
        <Tooltip open={isFloatingOptionsOpen ? false : undefined}>
          <PopoverTrigger
            className={cn(buttonVariants({ variant: 'ghost', size: 'iconXs' }), 'ml-0.5')}
            onClick={() => {
              setFloatingOptionsOpen(true)
            }}
          >
            <TooltipTrigger asChild>
              <SlidersHorizontal className="size-3 cursor-pointer text-muted-foreground" />
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipPortal>
            <TooltipContent className="mt-1.5" side="bottom">
              <b>Click</b> for more options
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent side="left" ref={floatingSectionRef}>
        Place content for the popover here.
      </PopoverContent>
    </Popover>
  )
}
