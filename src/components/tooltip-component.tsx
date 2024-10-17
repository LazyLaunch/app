import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface ActiveProps {
  url: string
  currentPath: string
  startAt?: number
  pageNames?: string[]
}

interface Props extends ActiveProps {
  text: string
  children: any
}

function isActive({ startAt, currentPath, url, pageNames }: ActiveProps): boolean {
  if (!startAt && typeof startAt !== 'number') {
    return currentPath === url
  }

  if (pageNames) {
    return pageNames.includes(currentPath.split('/').filter(Boolean)[startAt])
  }

  return currentPath.startsWith(url)
}

export function TooltipComponent({ children, text, url, currentPath, startAt, pageNames }: Props) {
  const active = isActive({ startAt, currentPath, url, pageNames })

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
              {
                'text-foreground': active,
              }
            )}
          >
            {children}
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
