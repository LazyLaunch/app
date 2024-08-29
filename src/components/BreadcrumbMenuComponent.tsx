import { ChevronsUpDown, Plus, Check } from 'lucide-react'

import { cn } from '@/lib/utils'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface LinkProps {
  children: any
  url: string
  active?: boolean
  className?: string
}

export interface ContentRowProps {
  text: string
  url: string
  active?: boolean
  className?: string
}

interface Props {
  title: string
  btnCreateText: string
  btnCreateUrl: string
  rows: ContentRowProps[]
  currentPath: string
}

const Link = ({ children, url, active, className }: LinkProps) => (
  <a
    href={url}
    className={cn(
      'flex w-full cursor-pointer items-center justify-between rounded px-2.5 py-1.5 text-sm hover:text-accent-foreground hover:bg-muted',
      className,
      {
        'bg-muted': active
      }
    )}
  >
    {children}
  </a>
)

const ContentRow = ({ text, url, active, className }: ContentRowProps) => (
  <Link url={url} active={active} className={className}>
    <div className="flex flex-col">
      <span className="leading-6">{text}</span>
    </div>
    {active && <Check size={20} strokeWidth={1.5} />}
  </Link>
)

export function BreadcrumbMenuComponent({
  btnCreateText,
  btnCreateUrl,
  title,
  rows,
  currentPath,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="iconSm" className="data-[state=open]:bg-accent text-gray-500 hover:text-gray-500">
          <ChevronsUpDown size={16} strokeWidth={1.5} className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-1.5 border-0 p-3" align="start">
        <div className="pb-1.5">
          <ContentRow
            text="My Account"
            url="/account"
            active={currentPath.startsWith('/account')}
          />
        </div>
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium tracking-normal">{title}</span>
          <a
            href={btnCreateUrl}
            className={`${buttonVariants({ size: 'xs', className: 'text-xs' })}`}
          >
            <Plus className="mr-1" size={16} strokeWidth={1.5} />
            {btnCreateText}
          </a>
        </div>
        <ScrollArea className="max-h-60 pt-1.5">
          {rows.map((row, index) => (
            <ContentRow {...row} active={currentPath === row.url} key={row.text + index} />
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
