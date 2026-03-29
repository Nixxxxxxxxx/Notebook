import { Layers3, Plus, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ProjectCard } from '@/components/cards/project-card'
import { EmptyState } from '@/components/states/empty-state'
import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { Badge } from '@/components/ui/badge'
import { buttonClassName } from '@/components/ui/button-styles'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { listProjects } from '@/features/projects/projects-service'
import type { Project } from '@/types/domain'

export function DashboardPage() {
  const { user, demoMode } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }

    void listProjects(user.id)
      .then((result) => {
        setProjects(result)
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load projects')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user])

  if (loading) {
    return (
      <LoadingState
        title="Loading your research workspace"
        description="Pulling projects, pattern counts, and shortlist context."
      />
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Dashboard could not load"
        description={error}
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary' })}>
            Retry
          </Link>
        }
      />
    )
  }

  const totalScreens = projects.reduce((sum, project) => sum + project.screenCount, 0)
  const totalClusters = projects.reduce((sum, project) => sum + project.clusterCount, 0)
  const totalShortlist = projects.reduce((sum, project) => sum + project.shortlistCount, 0)

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden px-8 py-10 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={demoMode ? 'warning' : 'success'}>
                {demoMode ? 'Demo workspace' : 'Supabase workspace'}
              </Badge>
              <Badge tone="accent">Dashboard</Badge>
            </div>
            <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl leading-[1.02] text-text sm:text-6xl">
              Your pattern boards are ready for uploads, grouping, and sharp curation.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              Keep projects compact, visually rich, and easy to review. Start from a new board or continue from the latest cluster pass.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <Card className="bg-white/80">
              <Layers3 className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm text-muted">Total screens</p>
              <p className="mt-1 text-3xl font-semibold text-text">{totalScreens}</p>
            </Card>
            <Card className="bg-white/80">
              <Sparkles className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm text-muted">Active clusters</p>
              <p className="mt-1 text-3xl font-semibold text-text">{totalClusters}</p>
            </Card>
            <Card className="bg-white/80">
              <Star className="h-5 w-5 text-accent" />
              <p className="mt-4 text-sm text-muted">Shortlist picks</p>
              <p className="mt-1 text-3xl font-semibold text-text">{totalShortlist}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Projects</p>
          <h2 className="mt-2 font-display text-4xl text-text">Pattern workspaces</h2>
        </div>
        <Link to="/projects/new" className={buttonClassName({ variant: 'primary', size: 'lg' })}>
          <Plus className="h-4 w-4" />
          Create project
        </Link>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-white/80">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Flow snapshot</p>
          <h3 className="mt-3 text-2xl font-semibold text-text">The full MVP path is already connected.</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Entry', 'Dashboard', 'Create', 'Upload', 'Library', 'Clusters', 'Compare', 'Shortlist'].map((step) => (
              <Badge key={step} tone="neutral">
                {step}
              </Badge>
            ))}
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            Keep each board narrow in scope. Pattern Miner works best when one project maps to one research question or one product surface area.
          </p>
        </Card>

        <Card className="bg-white/80">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">What to do next</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-canvas px-4 py-4">
              <p className="text-sm font-semibold text-text">1. Create</p>
              <p className="mt-2 text-sm leading-6 text-muted">Name the board and anchor its platform and category.</p>
            </div>
            <div className="rounded-[22px] bg-canvas px-4 py-4">
              <p className="text-sm font-semibold text-text">2. Upload</p>
              <p className="mt-2 text-sm leading-6 text-muted">Add a tight batch of screenshots and validate them before storage.</p>
            </div>
            <div className="rounded-[22px] bg-canvas px-4 py-4">
              <p className="text-sm font-semibold text-text">3. Curate</p>
              <p className="mt-2 text-sm leading-6 text-muted">Review clusters, compare strong variants, and build a shortlist.</p>
            </div>
          </div>
        </Card>
      </section>

      {projects.length === 0 ? (
        <EmptyState
          eyebrow="Empty state"
          title="Create your first pattern board"
          description="Start with a platform, category, and a short description. Then upload a batch of interface screenshots and let the library grow from there."
          action={
            <Link to="/projects/new" className={buttonClassName({ variant: 'primary' })}>
              Create project
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
