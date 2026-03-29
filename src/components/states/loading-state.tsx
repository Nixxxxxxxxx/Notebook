interface LoadingStateProps {
  title: string
  description?: string
}

export function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="surface-card flex flex-col items-center justify-center px-8 py-12 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      <h2 className="mt-6 font-display text-3xl text-text">{title}</h2>
      {description ? <p className="mt-3 max-w-xl text-base text-muted">{description}</p> : null}
    </div>
  )
}
