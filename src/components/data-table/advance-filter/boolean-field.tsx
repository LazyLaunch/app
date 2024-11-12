import { CustomFieldTypeEnum } from '@/types'

export function BooleanField({ className, type }: { className?: string; type?: string }) {
  const isBooleanType = type === CustomFieldTypeEnum.BOOLEAN

  return (
    isBooleanType && (
      <div className={className}>
        <div
          aria-label="Number filter is empty"
          className="h-full w-full rounded border border-dashed"
        />
      </div>
    )
  )
}
