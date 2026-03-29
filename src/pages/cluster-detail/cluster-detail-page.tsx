import { ArrowRight, Save, Sparkles, X } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  getCluster,
  listClusters,
  moveScreen,
  updateCluster,
} from '@/features/clusters/clusters-service'
import { getProject } from '@/features/projects/projects-service'
import { listScreens } from '@/features/screens/screens-service'
import { addToShortlist } from '@/features/shortlist/shortlist-service'
import type { Cluster, Project, Screen } from '@/types/domain'

export function ClusterDetailPage() {
  const { projectId, clusterId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [cluster, setCluster] = useState<Cluster | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [nextTag, setNextTag] = useState('')
  const [loading, setLoading] = useState(Boolean(projectId && clusterId))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const refreshWorkspace = () => {
    if (!projectId || !clusterId) {
      return
    }

    void Promise.all([
      getProject(projectId),
      getCluster(projectId, clusterId),
      listClusters(projectId),
      listScreens(projectId),
    ])
      .then(([nextProject, nextCluster, nextClusters, nextScreens]) => {
        setProject(nextProject)
        setCluster(nextCluster)
        setClusters(nextClusters)
        setScreens(nextScreens)
        if (!nextProject || !nextCluster) {
          setError('Cluster not found')
          return
        }

        setTitle(nextCluster.title)
        setNote(nextCluster.note)
        setTags(nextCluster.tags)
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load cluster detail')
      })
      .finally(() => {
      })
  }

  useEffect(() => {
    if (!projectId || !clusterId) {
      return
    }

    void Promise.all([
      getProject(projectId),
      getCluster(projectId, clusterId),
      listClusters(projectId),
      listScreens(projectId),
    ])
      .then(([nextProject, nextCluster, nextClusters, nextScreens]) => {
        setProject(nextProject)
        setCluster(nextCluster)
        setClusters(nextClusters)
        setScreens(nextScreens)
        if (!nextProject || !nextCluster) {
          setError('Cluster not found')
          return
        }

        setTitle(nextCluster.title)
        setNote(nextCluster.note)
        setTags(nextCluster.tags)
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load cluster detail')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [clusterId, projectId])

  if (loading) {
    return (
      <LoadingState
        title="Opening the cluster canvas"
        description="Pulling titles, notes, tags, and the screen set for review."
      />
    )
  }

  if (!project || !cluster || error) {
    return (
      <ErrorState
        title="Cluster detail is unavailable"
        description={error || 'The cluster could not be loaded.'}
        action={
          <Link to={`/projects/${projectId}/clusters`} className={buttonClassName({ variant: 'secondary' })}>
            Back to clusters
          </Link>
        }
      />
    )
  }

  const clusterScreens = screens.filter((screen) => screen.clusterId === cluster.id)
  const otherClusters = clusters.filter((entry) => entry.id !== cluster.id)
  const canCompare = selected.length >= 2 && selected.length <= 4

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        project={project}
        eyebrow="Cluster detail"
        title={cluster.title}
        description="Rename the cluster, adjust tags and notes, move outliers, compare strong screens, and shortlist the references worth keeping."
        actions={
          <Button
            type="button"
            disabled={saving}
            onClick={() => {
              setSaving(true)
              void updateCluster(cluster.id, {
                title: title.trim() || cluster.title,
                note: note.trim(),
                tags,
                status: 'edited',
              })
                .then(() => refreshWorkspace())
                .finally(() => setSaving(false))
            }}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save changes'}
          </Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Cluster info</p>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Title</span>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Notes</span>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What feels consistent inside this cluster? What still needs a manual decision?"
                />
              </label>

              <div>
                <span className="mb-2 block text-sm font-semibold text-text">Tags</span>
                <div className="flex gap-2">
                  <Input
                    value={nextTag}
                    onChange={(event) => setNextTag(event.target.value)}
                    placeholder="Add tag"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      const normalized = nextTag.trim()
                      if (!normalized || tags.includes(normalized)) {
                        return
                      }
                      setTags((current) => [...current, normalized])
                      setNextTag('')
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTags((current) => current.filter((item) => item !== tag))}
                      className="inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-2 text-sm font-semibold text-text"
                    >
                      {tag}
                      <X className="h-3.5 w-3.5 text-muted" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="accent">{cluster.status.replace('_', ' ')}</Badge>
              <Badge tone="neutral">{clusterScreens.length} screens</Badge>
              <Badge tone="neutral">{Math.round(cluster.confidence * 100)}% confidence</Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={selected.length === 0}
                onClick={() => {
                  if (!projectId || selected.length === 0) {
                    return
                  }

                  void addToShortlist(projectId, selected, 'Standout flows')
                }}
              >
                <Sparkles className="h-4 w-4" />
                Add selected to shortlist
              </Button>
              <Link
                to={
                  canCompare
                    ? `/projects/${project.id}/compare?screens=${selected.join(',')}&fromCluster=${cluster.id}`
                    : '#'
                }
                className={buttonClassName({
                  variant: canCompare ? 'primary' : 'secondary',
                  className: canCompare ? '' : 'pointer-events-none opacity-60',
                })}
              >
                Compare selection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div>
          {clusterScreens.length === 0 ? (
            <EmptyState
              eyebrow="Empty cluster"
              title="No screens remain in this group"
              description="You can go back to the cluster overview and merge or rebuild the grouping, or upload new references for another pass."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {clusterScreens.map((screen) => (
                <ScreenCard
                  key={screen.id}
                  screen={screen}
                  selected={selected.includes(screen.id)}
                  onToggle={(screenId) => {
                    setSelected((current) =>
                      current.includes(screenId)
                        ? current.filter((id) => id !== screenId)
                        : current.length >= 4
                          ? current
                          : [...current, screenId],
                    )
                  }}
                  footer={
                    <Select
                      value={screen.clusterId ?? ''}
                      onChange={(event) => {
                        const target = event.target.value || null
                        void moveScreen(screen.id, target)
                          .then(() => refreshWorkspace())
                          .catch((reason) => {
                            setError(
                              reason instanceof Error ? reason.message : 'Could not move screen',
                            )
                          })
                      }}
                    >
                      <option value="">Ungroup this screen</option>
                      {otherClusters.map((entry) => (
                        <option key={entry.id} value={entry.id}>
                          {entry.title}
                        </option>
                      ))}
                    </Select>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
