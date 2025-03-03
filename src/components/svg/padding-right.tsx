import { cn } from '@/lib/utils'

export function PaddingRightSvg({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-align-horizontal-space-around', className)}
    >
      <rect width="6" height="10" x="9" y="7" rx="2" />
      <path d="M20 22V2" />
    </svg>
  )
}
