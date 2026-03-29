import { Eye, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { Button } from '@/components/ui/button'
import { buttonClassName } from '@/components/ui/button-styles'
import { Badge } from '@/components/ui/badge'
import { getProject } from '@/features/projects/projects-service'
import { listScreens } from '@/features/screens/screens-service'
import { addToShortlist } from '@/features/shortlist/shortlist-service'
import type { Project, Screen } from '@/types/domain'

export function ComparePage() {
  const { projectId } = useParams()
  const [params] = useSearchParams()
  const [project, setProject] = useState<Project | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')
  const [focusMode, setFocusMode] = useState(false)
  const selectedIds = params
    .get('screens')
    ?.split(',')
    .map((value) => value.trim())
    .filter(Boolean) ?? []
  const fromCluster = params.get('fromCluster')

  useEffect(() => {
    if (!projectId) {
      return
    }

    void Promise.all([getProject(projectId), listScreens(projectId)])
      .then(([nextProject, nextScreens]) => {
        setProject(nextProject)
        setScreens(nextScreens)
        if (!nextProject) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load compare view')
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <LoadingState
        title="Preparing compare mode"
        description="Loading the selected screens and keeping their order intact."
      />
    )
  }

  if (!project || error) {
    return (
      <ErrorState
        title="Compare is unavailable"
        description={error || 'The project could not be loaded.'}
        action={
          <Link
            to={fromCluster ? `/projects/${projectId}/clusters/${fromCluster}` : `/projects/${projectId}/library`}
            className={buttonClassName({ variant: 'secondary' })}
          >
            Back
          </Link>
        }
      />
    )
  }

  if (selectedIds.length < 2) {
    return (
      <ErrorState
        title="Select at least two screens"
        description="Compare is designed for 2 to 4 screens. Return to the library or cluster detail, pick more references, and try again."
        action={
          <Link
            to={fromCluster ? `/projects/${project.id}/clusters/${fromCluster}` : `/projects/${project.id}/library`}
            className={buttonClassName({ variant: 'secondary' })}
          >
            Back to selection
          </Link>
        }
      />
    )
  }

  if (selectedIds.length > 4) {
    return (
      <ErrorState
        title="Too many screens selected"
        description="Keep compare focused. Choose up to four screens so the layout stays readable and the decision remains sharp."
        action={
          <Link
            to={fromCluster ? `/projects/${project.id}/clusters/${fromCluster}` : `/projects/${project.id}/library`}
            className={buttonClassName({ variant: 'secondary' })}
          >
            Back to selection
          </Link>
        }
      />
    )
  }

  const screensById = new Map(screens.map((screen) => [screen.id, screen]))
  const selectedScreens = selectedIds.flatMap((screenId) => {
    const screen = screensById.get(screenId)
    return screen ? [screen] : []
  })

  return (
    <div className="space-y-6">
      <section className="surface-panel px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">Compare</Badge>
              <Badge tone="neutral">{selectedScreens.length} screens</Badge>
            </div>
            <h1 className="mt-4 font-display text-5xl text-text">See the strongest patterns side by side.</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
              Keep only 2 to 4 references on stage, switch into focus mode when needed, and save the standouts directly into the shortlist.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => setFocusMode((current) => !current)}>
              <Eye className="h-4 w-4" />
              {focusMode ? 'Exit focus mode' : 'Focus mode'}
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (!projectId) {
                  return
                }

                void addToShortlist(projectId, selectedScreens.map((screen) => screen.id), 'Standout flows')
              }}
            >
              <Sparkles className="h-4 w-4" />
              Add to shortlist
            </Button>
          </div>
        </div>
      </section>

      <section
        className={`grid gap-5 ${selectedScreens.length === 2 ? 'lg:grid-cols-2' : selectedScreens.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}
      >
        {selectedScreens.map((screen) => (
          <article key={screen.id} className="surface-card overflow-hidden p-0">
            <div className="aspect-[4/5] overflow-hidden bg-canvas">
              <img src={screen.imageUrl} alt={screen.name} className="h-full w-full object-cover" />
            </div>
            {!focusMode ? (
              <div className="space-y-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">{screen.status}</Badge>
                </div>
                <h2 className="text-xl font-semibold text-text">{screen.name}</h2>
                <p className="text-sm leading-6 text-muted">
                  Source: {screen.source === 'demo' ? 'Demo seed' : 'Upload batch'}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  )
}
