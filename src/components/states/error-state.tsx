import type { ReactNode } from 'react'

interface ErrorStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="surface-card px-8 py-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-warning">Something slipped</p>
      <h2 className="mt-4 font-display text-4xl text-text">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  )
}
