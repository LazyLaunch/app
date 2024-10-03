import { cn, withRef } from '@udecode/cn'
import { PlateElement, useElement } from '@udecode/plate-common/react'
import { useLink } from '@udecode/plate-link/react'

import type { TLinkElement } from '@udecode/plate-link'

export const LinkElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement<TLinkElement>()
    const { props: linkProps } = useLink({ element })

    return (
      <PlateElement
        asChild
        className={cn('', className)}
        ref={ref}
        {...(linkProps as any)}
        {...props}
      >
        <a className="text-primary underline-offset-4 hover:underline">{children}</a>
      </PlateElement>
    )
  }
)
