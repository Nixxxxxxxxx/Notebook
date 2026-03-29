import type { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils/cn'

interface BadgeProps extends PropsWithChildren {
  tone?: 'neutral' | 'accent' | 'success' | 'warning'
  className?: string
}

const toneClasses = {
  neutral: 'bg-canvas text-muted',
  accent: 'bg-accentSoft text-accent',
  success: 'bg-[rgba(79,137,110,0.12)] text-success',
  warning: 'bg-[rgba(184,114,52,0.12)] text-warning',
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
