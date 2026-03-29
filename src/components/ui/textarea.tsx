import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full rounded-[20px] border bg-white px-4 py-3 text-base text-text outline-none transition placeholder:text-muted/70 focus:border-accent/50 focus:ring-4 focus:ring-accent/10',
        error ? 'border-[#c06d55]' : 'border-line',
        className,
      )}
      {...props}
    />
  )
}
