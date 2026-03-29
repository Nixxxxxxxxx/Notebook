import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ScreenCard } from '@/components/cards/screen-card'
import { ProjectWorkspaceHeader } from '@/components/navigation/project-workspace-header'
import { EmptyState } from '@/components/states/empty-state'
import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClassName } from '@/components/ui/button-styles'
import { Select } from '@/components/ui/select'
import { getProject } from '@/features/projects/projects-service'
import {
  listShortlist,
  removeShortlistItem,
  updateShortlistItem,
} from '@/features/shortlist/shortlist-service'
import { shortlistGroups } from '@/lib/constants/project-options'
import type { Project, ShortlistEntry } from '@/types/domain'

export function ShortlistPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [entries, setEntries] = useState<ShortlistEntry[]>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')

  const refreshWorkspace = () => {
    if (!projectId) {
      return
    }

    void Promise.all([getProject(projectId), listShortlist(projectId)])
      .then(([nextProject, nextEntries]) => {
        setProject(nextProject)
        setEntries(nextEntries)
        if (!nextProject) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load shortlist')
      })
  }

  useEffect(() => {
    if (!projectId) {
      return
    }

    void Promise.all([getProject(projectId), listShortlist(projectId)])
      .then(([nextProject, nextEntries]) => {
        setProject(nextProject)
        setEntries(nextEntries)
        if (!nextProject) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load shortlist')
      })
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <LoadingState
        title="Opening the shortlist"
        description="Loading curated picks and grouping them into decision-ready sections."
      />
    )
  }

  if (!project || error) {
    return (
      <ErrorState
        title="Shortlist is unavailable"
        description={error || 'The project could not be loaded.'}
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary' })}>
            Back to dashboard
          </Link>
        }
      />
    )
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <ProjectWorkspaceHeader
          project={project}
          eyebrow="Shortlist"
          title="Curate the strongest references into one final board."
          description="The shortlist should feel intentional, not like a dump. Save only the screens you would actually revisit during design work."
        />
        <EmptyState
          eyebrow="Empty shortlist"
          title="Nothing is pinned yet"
          description="Save promising references from the library, cluster detail, or compare view and they will appear here as a curated board."
          action={
            <Link to={`/projects/${project.id}/library`} className={buttonClassName({ variant: 'primary' })}>
              Explore library
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        project={project}
        eyebrow="Shortlist"
        title="Curate the strongest references into one final board."
        description="Regroup picks lightly, adjust order inside each section, and keep only the references that still feel worth studying."
      />

      {shortlistGroups.map((group) => {
        const groupEntries = entries
          .filter((entry) => entry.group === group)
          .sort((left, right) => left.position - right.position)

        if (groupEntries.length === 0) {
          return null
        }

        return (
          <section key={group} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{group}</Badge>
              <Badge tone="neutral">{groupEntries.length} saved</Badge>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {groupEntries.map((entry, index) => {
                const previous = groupEntries[index - 1]
                const next = groupEntries[index + 1]

                return (
                  <ScreenCard
                    key={entry.id}
                    screen={entry.screen}
                    footer={
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-text">{entry.label || 'Saved reference'}</p>
                        <Select
                          value={entry.group}
                          onChange={(event) => {
                            if (!projectId) {
                              return
                            }

                            const nextGroup = event.target.value as (typeof shortlistGroups)[number]
                            const targetPosition = entries.filter((item) => item.group === nextGroup).length
                            void updateShortlistItem(projectId, entry.id, {
                              group: nextGroup,
                              position: targetPosition,
                            }).then(() => refreshWorkspace())
                          }}
                        >
                          {shortlistGroups.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </Select>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={!previous}
                            onClick={() => {
                              if (!projectId || !previous) {
                                return
                              }

                              void Promise.all([
                                updateShortlistItem(projectId, entry.id, { position: previous.position }),
                                updateShortlistItem(projectId, previous.id, { position: entry.position }),
                              ]).then(() => refreshWorkspace())
                            }}
                          >
                            <ChevronUp className="h-4 w-4" />
                            Up
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={!next}
                            onClick={() => {
                              if (!projectId || !next) {
                                return
                              }

                              void Promise.all([
                                updateShortlistItem(projectId, entry.id, { position: next.position }),
                                updateShortlistItem(projectId, next.id, { position: entry.position }),
                              ]).then(() => refreshWorkspace())
                            }}
                          >
                            <ChevronDown className="h-4 w-4" />
                            Down
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              if (!projectId) {
                                return
                              }

                              void removeShortlistItem(projectId, entry.id).then(() => refreshWorkspace())
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    }
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
