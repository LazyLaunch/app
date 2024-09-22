import * as ToolbarPrimitive from '@radix-ui/react-toolbar'
import { cn, withCn, withRef } from '@udecode/cn'
import { ChevronDown } from 'lucide-react'
import * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { withTooltip } from '@/components/plate-ui/tooltip'

import type { VariantProps } from 'class-variance-authority'

export const Toolbar = withCn(
  ToolbarPrimitive.Root,
  'relative flex select-none items-center rounded-lg border bg-card text-card-foreground shadow-sm'
)
export const ToolbarToggleGroup = withCn(ToolbarPrimitive.ToggleGroup, 'flex items-center')
// export const ToolbarLink = withCn(ToolbarPrimitive.Link, 'font-medium underline underline-offset-4')
// export const ToolbarSeparator = withCn(ToolbarPrimitive.Separator, 'my-1 w-px shrink-0 bg-border')

export const ToolbarToggleItem = ToolbarPrimitive.ToggleItem

export const ToolbarButton = withTooltip(
  React.forwardRef<
    React.ElementRef<typeof ToolbarToggleItem>,
    {
      isDropdown?: boolean
      pressed?: boolean
    } & Omit<React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>, 'asChild'> &
      VariantProps<typeof buttonVariants>
  >(({ children, className, isDropdown, pressed, size, variant, value, ...props }, ref) => {
    if (typeof pressed === 'boolean') {
      return (
        <ToolbarToggleItem
          className={cn(
            'data-[state=open]:bg-accent',
            'aria-[pressed=true]:bg-accent',
            buttonVariants({
              size,
              variant,
            }),
            isDropdown && 'space-x-1',
            className
          )}
          ref={ref}
          value={pressed ? value : ''}
          aria-label={value}
          {...props}
        >
          {isDropdown ? (
            <>
              {children}
              <ChevronDown className="size-3" />
            </>
          ) : (
            children
          )}
        </ToolbarToggleItem>
      )
    }

    return (
      <ToolbarPrimitive.Button
        className={cn(
          buttonVariants({
            size,
            variant,
          }),
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Button>
    )
  })
)
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName

type ToolbarGroupProps = {
  noSeparator?: boolean
  ariaLabel: string
  className?: string
  children: React.ReactNode
} & (
  | {
      type?: 'multiple'
      value?: string[]
    }
  | {
      type?: 'single'
      value?: string
    }
)

export const ToolbarGroup = withRef<'div', ToolbarGroupProps>(
  ({ children, className, noSeparator, ariaLabel, type = 'multiple', value = [] }, ref) => {
    const childArr = React.Children.map(children, (c) => c)

    if (!childArr || childArr.length === 0) return null

    return (
      <>
        <ToolbarToggleGroup
          ref={ref}
          className={cn('space-x-0.5', className)}
          aria-label={ariaLabel}
          type={type as 'multiple' | 'single'}
          value={value as any}
        >
          {children}
        </ToolbarToggleGroup>
        {!noSeparator && <Separator className="h-auto" orientation="vertical" />}
      </>
    )
  }
)
