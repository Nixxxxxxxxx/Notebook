import type { PropsWithChildren, ReactNode } from 'react'

interface EmptyStateProps extends PropsWithChildren {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="surface-card px-8 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl text-text">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}
