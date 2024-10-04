import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

interface ActiveProps {
  url: string
  currentPath: string
  segments: number
  nestedUrl?: string
}

interface Props {
  text: string
  url: string
  currentPath: string
  children: any
  segments?: number
  nestedUrl?: string
}

function isActive({ segments, currentPath, nestedUrl, url }: ActiveProps): boolean {
  if (segments < 2) {
    return currentPath === url
  }

  if (nestedUrl) {
    return currentPath.startsWith(nestedUrl) && currentPath !== nestedUrl
  }

  return currentPath.startsWith(url)
}

export function TooltipComponent({
  children,
  text,
  url,
  currentPath,
  segments = 1,
  nestedUrl,
}: Props) {
  const active = isActive({ segments, currentPath, nestedUrl, url })

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
