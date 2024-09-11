import { withRef, withVariants } from '@udecode/cn'
import { PlateElement } from '@udecode/plate-common/react'
import { cva } from 'class-variance-authority'

const headingVariants = cva('', {
  variants: {
    isFirstBlock: {
      false: '',
      true: 'mt-0',
    },
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
      h2: 'scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
    },
  },
})

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  'isFirstBlock',
  'variant',
])

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ children, isFirstBlock, variant = 'h1', ...props }, ref) => {
    const { editor, element } = props

    const Element = variant!

    return (
      <HeadingElementVariants
        asChild
        isFirstBlock={element === editor.children[0]}
        ref={ref}
        variant={variant}
        {...props}
      >
        <Element>{children}</Element>
      </HeadingElementVariants>
    )
  }
)
