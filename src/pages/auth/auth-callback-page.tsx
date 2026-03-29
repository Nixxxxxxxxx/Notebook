import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { demoMode, finishDemoSignIn, loading, user } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (demoMode) {
      const email = params.get('email') ?? undefined
      void finishDemoSignIn(email)
        .then(() => {
          navigate('/dashboard', { replace: true })
        })
        .catch((reason) => {
          setError(reason instanceof Error ? reason.message : 'Could not complete demo sign in')
        })
      return
    }

    if (!loading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [demoMode, finishDemoSignIn, loading, navigate, params, user])

  const displayError =
    error || (!demoMode && !loading && !user
      ? 'No active auth session was detected. Request a fresh magic link and try again.'
      : '')

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-panel max-w-lg px-8 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          Auth callback
        </p>
        <h1 className="mt-4 font-display text-4xl text-text">Connecting your workspace</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          {displayError
            ? displayError
            : demoMode
              ? 'Finishing the local demo handoff and preparing your seeded workspace.'
              : 'Verifying your Supabase session and routing you into Pattern Miner.'}
        </p>
        {displayError ? (
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => {
              navigate('/', { replace: true })
            }}
          >
            Back to entry
          </Button>
        ) : null}
      </div>
    </div>
  )
}
