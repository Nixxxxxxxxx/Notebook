import { Search, Sparkles } from 'lucide-react'
import { useDeferredValue, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ProjectWorkspaceHeader } from '@/components/navigation/project-workspace-header'
import { ScreenCard } from '@/components/cards/screen-card'
import { EmptyState } from '@/components/states/empty-state'
import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClassName } from '@/components/ui/button-styles'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { getProject } from '@/features/projects/projects-service'
import { listScreens } from '@/features/screens/screens-service'
import { addToShortlist } from '@/features/shortlist/shortlist-service'
import type { Project, Screen } from '@/types/domain'

type LibraryFilter = 'all' | Screen['status']
type SortMode = 'newest' | 'oldest' | 'name'

export function LibraryPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [sort, setSort] = useState<SortMode>('newest')
  const [selected, setSelected] = useState<string[]>([])
  const deferredSearch = useDeferredValue(search)

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
        setError(reason instanceof Error ? reason.message : 'Could not load library')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId])

  let filteredScreens = screens

  if (filter !== 'all') {
    filteredScreens = filteredScreens.filter((screen) => screen.status === filter)
  }

  if (deferredSearch.trim()) {
    const query = deferredSearch.toLowerCase()
    filteredScreens = filteredScreens.filter((screen) =>
      screen.name.toLowerCase().includes(query),
    )
  }

  if (sort === 'name') {
    filteredScreens = [...filteredScreens].sort((left, right) => left.name.localeCompare(right.name))
  } else {
    filteredScreens = [...filteredScreens].sort((left, right) =>
      sort === 'newest'
        ? right.createdAt.localeCompare(left.createdAt)
        : left.createdAt.localeCompare(right.createdAt),
    )
  }

  if (loading) {
    return (
      <LoadingState
        title="Building the library grid"
        description="Fetching screens, status markers, and project context."
      />
    )
  }

  if (!project || error) {
    return (
      <ErrorState
        title="Library is unavailable"
        description={error || (!projectId ? 'Missing project id.' : 'The project could not be loaded.')}
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary' })}>
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const selectedCount = selected.length
  const canCompare = selectedCount >= 2 && selectedCount <= 4

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        project={project}
        eyebrow="Library"
        title="Read the full screen set before refining the clusters."
        description="Search the project, filter by grouping status, select screens for compare, and save promising references straight into the shortlist."
        actions={
          <Link to={`/projects/${project.id}/upload`} className={buttonClassName({ variant: 'secondary' })}>
            Add more files
          </Link>
        }
      />

      <section className="surface-card p-6">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.5fr_0.5fr_auto_auto] lg:items-center">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-11"
              placeholder="Search screen names"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <Select value={filter} onChange={(event) => setFilter(event.target.value as LibraryFilter)}>
            <option value="all">All statuses</option>
            <option value="grouped">Grouped</option>
            <option value="ungrouped">Ungrouped</option>
            <option value="duplicate">Duplicate</option>
          </Select>

          <Select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name</option>
          </Select>

          <Button
            type="button"
            variant="secondary"
            disabled={selectedCount === 0}
            onClick={() => {
              if (!projectId || selectedCount === 0) {
                return
              }

              void addToShortlist(projectId, selected, 'Standout flows')
            }}
          >
            <Sparkles className="h-4 w-4" />
            Add to shortlist
          </Button>

          <Link
            to={canCompare ? `/projects/${project.id}/compare?screens=${selected.join(',')}` : '#'}
            className={buttonClassName({
              variant: canCompare ? 'primary' : 'secondary',
              className: canCompare ? '' : 'pointer-events-none opacity-60',
            })}
          >
            Compare {selectedCount || ''}
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Badge tone="neutral">{screens.length} screens</Badge>
          <Badge tone="success">{screens.filter((screen) => screen.status === 'grouped').length} grouped</Badge>
          <Badge tone="warning">{screens.filter((screen) => screen.status === 'ungrouped').length} ungrouped</Badge>
          <Badge tone="accent">{screens.filter((screen) => screen.status === 'duplicate').length} duplicate</Badge>
        </div>
      </section>

      {screens.length === 0 ? (
        <EmptyState
          eyebrow="Library empty"
          title="Upload a first screenshot batch"
          description="The library becomes the backbone for clusters, compare, and shortlist. Start with a tight batch so the first grouping pass feels coherent."
          action={
            <Link to={`/projects/${project.id}/upload`} className={buttonClassName({ variant: 'primary' })}>
              Go to upload
            </Link>
          }
        />
      ) : filteredScreens.length === 0 ? (
        <EmptyState
          eyebrow="No results"
          title="Nothing matches this search"
          description="Try a different keyword, reset filters, or switch sorting to surface the pattern you are looking for."
          action={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearch('')
                setFilter('all')
                setSort('newest')
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredScreens.map((screen) => {
            const selectedState = selected.includes(screen.id)

            return (
              <ScreenCard
                key={screen.id}
                screen={screen}
                selected={selectedState}
                onToggle={(screenId) => {
                  setSelected((current) =>
                    current.includes(screenId)
                      ? current.filter((id) => id !== screenId)
                      : current.length >= 4
                        ? current
                        : [...current, screenId],
                  )
                }}
              />
            )
          })}
        </section>
      )}
    </div>
  )
}
