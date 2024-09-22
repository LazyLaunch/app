import { withRef } from '@udecode/cn'
import { PlateLeaf } from '@udecode/plate-common/react'

export const CodeLeaf = withRef<typeof PlateLeaf>(({ children, className, ...props }, ref) => {
  return (
    <PlateLeaf
      asChild
      className="whitespace-pre-wrap rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
      ref={ref}
      {...props}
    >
      <code>{children}</code>
    </PlateLeaf>
  )
})
