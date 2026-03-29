import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement>, PropsWithChildren {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('surface-card p-6', className)} {...props}>
      {children}
    </div>
  )
}
