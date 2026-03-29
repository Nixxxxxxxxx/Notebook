import { ArrowRight, CheckCircle2, Mail, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Badge } from '@/components/ui/badge'
import { buttonClassName } from '@/components/ui/button-styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

const entrySchema = z.object({
  email: z.email('Enter a valid email address'),
})

type EntryFormValues = z.infer<typeof entrySchema>

export function EntryPage() {
  const { user, demoMode, requestMagicLink } = useAuth()
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [linkEmail, setLinkEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      email: '',
    },
  })

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = handleSubmit(async ({ email }) => {
    setStatus('idle')
    setErrorMessage('')

    try {
      await requestMagicLink(email)
      setLinkEmail(email)
      setStatus('sent')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Could not send a sign-in link')
    }
  })

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
            <div className="flex items-center gap-3">
              <Badge tone={demoMode ? 'warning' : 'success'}>
                {demoMode ? 'Demo mode active' : 'Supabase live auth'}
              </Badge>
            </div>
            <h2 className="mt-4 font-display text-4xl text-text">Sign in to start mining patterns</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Use a magic link to enter your workspace. If Supabase is not configured yet, the same flow drops you into a realistic local demo.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-[28px] border border-line bg-canvas/70 p-6">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Email</span>
                <Input
                  type="email"
                  placeholder="you@studio.com"
                  error={Boolean(errors.email)}
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email ? (
                  <span className="mt-2 block text-sm text-[#b85e46]">{errors.email.message}</span>
                ) : null}
              </label>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                <Mail className="h-4 w-4" />
                {isSubmitting ? 'Sending link...' : 'Send magic link'}
              </Button>

              {status === 'sent' ? (
                <div className="rounded-[22px] border border-[rgba(79,137,110,0.16)] bg-[rgba(79,137,110,0.08)] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
                    <div>
                      <p className="font-semibold text-text">Link sent to {linkEmail}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {demoMode
                          ? 'No inbox needed for local development. Continue to the demo workspace when ready.'
                          : 'Open the link from your inbox to complete sign in.'}
                      </p>
                    </div>
                  </div>
                  {demoMode ? (
                    <Link
                      to={`/auth/callback?mode=demo&email=${encodeURIComponent(linkEmail)}`}
                      className={buttonClassName({ variant: 'secondary', className: 'mt-4 w-full' })}
                    >
                      Continue to demo workspace
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {status === 'error' ? (
                <div className="rounded-[22px] border border-[rgba(184,114,52,0.18)] bg-[rgba(184,114,52,0.08)] p-4 text-sm leading-6 text-warning">
                  {errorMessage}
                </div>
              ) : null}
            </form>

            <div className="mt-6 rounded-[24px] bg-white/70 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-text">
                <Sparkles className="h-4 w-4 text-accent" />
                What you get right away
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                <li>One shared product flow from entry to shortlist</li>
                <li>Supabase-ready auth, storage, and data primitives</li>
                <li>Designer-first UI direction instead of a generic dashboard shell</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
