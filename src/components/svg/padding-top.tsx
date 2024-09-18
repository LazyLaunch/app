import { cn } from '@/lib/utils'

export function PaddingTopSvg({ className }: { className: string }) {
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
      className={cn('lucide lucide-align-vertical-space-around', className)}
    >
      <rect width="10" height="6" x="7" y="9" rx="2" />
      <path d="M22 4H2" />
    </svg>
  )
}
