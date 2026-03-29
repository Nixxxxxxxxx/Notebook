import { Link, Navigate } from 'react-router-dom'

import { useAuth } from '@/hooks/use-auth'

export function EntryPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1440px] items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-panel relative overflow-hidden px-8 py-10 sm:px-10 lg:px-14 lg:py-16">
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent" />
          <div className="relative max-w-2xl">
            <p className="inline-flex rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Pattern research workspace
            </p>
            <h1 className="mt-8 max-w-xl text-balance font-display text-5xl leading-[1.05] text-text sm:text-6xl">
              Turn chaotic UI screenshots into pattern clusters worth keeping.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              Collect references, form believable groups, compare strong variants, and curate a shortlist that feels ready for design work.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {['Cluster flows', 'Compare 2-4 screens', 'Build a shortlist'].map((item) => (
                <div
                  key={item}
                  className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-text"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card flex items-center justify-center px-6 py-8 sm:px-8">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Entry
            </p>
            <h2 className="mt-4 font-display text-4xl text-text">Sign in to start mining patterns</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Clean magic link auth, Supabase-ready backend, and a demo fallback for local exploration.
            </p>
            <div className="mt-8 rounded-[28px] border border-dashed border-line bg-canvas/60 p-6">
              <p className="text-sm text-muted">
                Auth flow lands here first. The functional email form is added in the next implementation step.
              </p>
              <Link
                to="/auth/callback?mode=demo"
                className="mt-5 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:translate-y-[-1px]"
              >
                Continue to placeholder callback
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
