import { cn } from '@/lib/utils/cn'

interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-accent/10', className)}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-300"
        style={{ width: `${Math.max(4, Math.min(value, 100))}%` }}
      />
    </div>
  )
}
