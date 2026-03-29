import { Layers3 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ClusterCard } from '@/components/cards/cluster-card'
import { ProjectWorkspaceHeader } from '@/components/navigation/project-workspace-header'
import { EmptyState } from '@/components/states/empty-state'
import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClassName } from '@/components/ui/button-styles'
import {
  listClusters,
  mergeClusters,
  splitCluster,
  updateCluster,
} from '@/features/clusters/clusters-service'
import { getProject } from '@/features/projects/projects-service'
import { listScreens } from '@/features/screens/screens-service'
import type { Cluster, Project, Screen } from '@/types/domain'

export function ClustersPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const refreshWorkspace = () => {
    if (!projectId) {
      return
    }

    void Promise.all([getProject(projectId), listClusters(projectId), listScreens(projectId)])
      .then(([nextProject, nextClusters, nextScreens]) => {
        setProject(nextProject)
        setClusters(nextClusters)
        setScreens(nextScreens)
        if (!nextProject) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load clusters')
      })
      .finally(() => {
        setBusy(false)
      })
  }

  useEffect(() => {
    if (!projectId) {
      return
    }

    void Promise.all([getProject(projectId), listClusters(projectId), listScreens(projectId)])
      .then(([nextProject, nextClusters, nextScreens]) => {
        setProject(nextProject)
        setClusters(nextClusters)
        setScreens(nextScreens)
        if (!nextProject) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load clusters')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId])

  if (loading) {
    return (
      <LoadingState
        title="Gathering clusters"
        description="Loading project groups, screens, and preview stacks."
      />
    )
  }

  if (!project || error) {
    return (
      <ErrorState
        title="Clusters are unavailable"
        description={error || (!projectId ? 'Missing project id.' : 'The project could not be loaded.')}
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary' })}>
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const selectedClusters = clusters.filter((cluster) => selectedIds.includes(cluster.id))

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        project={project}
        eyebrow="Clusters"
        title="Review the first grouping pass, then tighten the pattern families."
        description="Open clusters, rename the good ones, split the noisy ones, and merge only the groups that clearly belong together."
        actions={
          <Button
            type="button"
            variant="secondary"
            disabled={selectedClusters.length !== 2 || busy}
            onClick={() => {
              if (selectedClusters.length !== 2 || !projectId) {
                return
              }

              const [target, source] = selectedClusters
              setBusy(true)
              void mergeClusters(projectId, source.id, target.id)
                .then(() => {
                  setSelectedIds([])
                  refreshWorkspace()
                })
                .finally(() => setBusy(false))
            }}
          >
            <Layers3 className="h-4 w-4" />
            Merge selected
          </Button>
        }
      />

      <section className="surface-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="neutral">{clusters.length} total clusters</Badge>
          <Badge tone="accent">{clusters.filter((cluster) => cluster.status === 'suggested').length} suggested</Badge>
          <Badge tone="success">{clusters.filter((cluster) => cluster.status === 'edited').length} edited</Badge>
          <Badge tone="warning">{clusters.filter((cluster) => cluster.status === 'review_needed').length} review needed</Badge>
        </div>
      </section>

      {clusters.length === 0 ? (
        <EmptyState
          eyebrow="No clusters"
          title="Upload a batch to create the first groups"
          description="Clusters appear after the first upload pass. Keep the initial batch focused so the suggested groupings feel believable and easy to review."
          action={
            <Link to={`/projects/${project.id}/upload`} className={buttonClassName({ variant: 'primary' })}>
              Go to upload
            </Link>
          }
        />
      ) : (
        <section className="space-y-6">
          {clusters.map((cluster) => {
            const clusterScreens = screens.filter((screen) => screen.clusterId === cluster.id)
            return (
              <ClusterCard
                key={cluster.id}
                projectId={project.id}
                cluster={cluster}
                previews={clusterScreens}
                screenCount={clusterScreens.length}
                selected={selectedIds.includes(cluster.id)}
                onToggleSelect={(clusterId) => {
                  setSelectedIds((current) =>
                    current.includes(clusterId)
                      ? current.filter((id) => id !== clusterId)
                      : current.length >= 2
                        ? [current[1] ?? current[0], clusterId].filter(Boolean) as string[]
                        : [...current, clusterId],
                  )
                }}
                onRename={async (clusterId, title) => {
                  await updateCluster(clusterId, { title, status: 'edited' })
                  await refreshWorkspace()
                }}
                onSplit={async (clusterId) => {
                  if (!projectId) {
                    return
                  }
                  await splitCluster(projectId, clusterId)
                  await refreshWorkspace()
                }}
              />
            )
          })}
        </section>
      )}
    </div>
  )
}
