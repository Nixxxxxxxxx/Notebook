import { Navigate } from 'react-router-dom'

import { AppShell } from '@/app/layouts/app-shell'
import { useAuth } from '@/hooks/use-auth'

export function ProtectedLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="surface-panel px-8 py-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted">
            Pattern Miner
          </p>
          <h1 className="mt-3 font-display text-3xl text-text">Warming up your workspace</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <AppShell />
}
