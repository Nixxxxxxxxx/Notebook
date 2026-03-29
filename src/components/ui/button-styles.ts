import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-glow hover:translate-y-[-1px] hover:bg-accent/90 disabled:bg-accent/60',
  secondary:
    'bg-white text-text border border-line hover:border-accent/40 hover:text-accent disabled:text-muted',
  ghost:
    'bg-transparent text-muted hover:bg-white/80 hover:text-text disabled:text-muted/70',
  danger:
    'bg-[#B85E46] text-white hover:bg-[#a34f39] disabled:bg-[#c79184]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
