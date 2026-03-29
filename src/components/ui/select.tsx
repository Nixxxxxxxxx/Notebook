import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-[20px] border bg-white px-4 py-3 text-base text-text outline-none transition focus:border-accent/50 focus:ring-4 focus:ring-accent/10',
        error ? 'border-[#c06d55]' : 'border-line',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
