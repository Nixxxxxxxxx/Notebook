import { useState } from 'react'
import { ArrowRight, Check, GitBranchPlus, Split } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClassName } from '@/components/ui/button-styles'
import { Input } from '@/components/ui/input'
import type { Cluster, Screen } from '@/types/domain'
import { formatPercent } from '@/lib/utils/format'

interface ClusterCardProps {
  projectId: string
  cluster: Cluster
  previews: Screen[]
  screenCount: number
  selected: boolean
  onToggleSelect: (clusterId: string) => void
  onRename: (clusterId: string, title: string) => Promise<void>
  onSplit: (clusterId: string) => Promise<void>
}

const toneMap: Record<Cluster['status'], 'accent' | 'success' | 'warning'> = {
  suggested: 'accent',
  edited: 'success',
  review_needed: 'warning',
}

export function ClusterCard({
  projectId,
  cluster,
  previews,
  screenCount,
  selected,
  onToggleSelect,
  onRename,
  onSplit,
}: ClusterCardProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(cluster.title)
  const [saving, setSaving] = useState(false)

  return (
    <article className={`surface-card overflow-hidden p-0 transition ${selected ? 'ring-2 ring-accent/30' : ''}`}>
      <div className="grid gap-0 xl:grid-cols-[1fr_1.1fr]">
        <div className="grid min-h-56 grid-cols-3 gap-1 bg-canvas p-1">
          {previews.slice(0, 3).map((screen) => (
            <img
              key={screen.id}
              src={screen.thumbnailUrl}
              alt={screen.name}
              className="h-full min-h-56 w-full rounded-[18px] object-cover"
            />
          ))}
          {previews.length === 0 ? (
            <div className="col-span-3 flex items-center justify-center rounded-[18px] border border-dashed border-line bg-white/60 text-sm text-muted">
              No previews yet
            </div>
          ) : null}
        </div>

        <div className="flex flex-col justify-between p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={toneMap[cluster.status]}>{cluster.status.replace('_', ' ')}</Badge>
              <Badge tone="neutral">{formatPercent(cluster.confidence)}</Badge>
              <button
                type="button"
                onClick={() => onToggleSelect(cluster.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
                  selected ? 'bg-accent text-white' : 'bg-canvas text-muted'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                Merge select
              </button>
            </div>

            <div className="mt-5">
              {editing ? (
                <div className="flex gap-2">
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                  <Button
                    type="button"
                    disabled={saving || title.trim().length < 3}
                    onClick={() => {
                      setSaving(true)
                      void onRename(cluster.id, title.trim())
                        .then(() => {
                          setEditing(false)
                        })
                        .finally(() => setSaving(false))
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-balance font-display text-3xl text-text">{cluster.title}</h3>
                  <p className="mt-3 text-base leading-7 text-muted">{cluster.note}</p>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {cluster.tags.map((tag) => (
                <Badge key={tag} tone="neutral" className="normal-case tracking-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">{screenCount} screens in cluster</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditing((current) => !current)}>
                <GitBranchPlus className="h-4 w-4" />
                Rename
              </Button>
              <Button type="button" variant="ghost" onClick={() => void onSplit(cluster.id)}>
                <Split className="h-4 w-4" />
                Split
              </Button>
              <Link
                to={`/projects/${projectId}/clusters/${cluster.id}`}
                className={buttonClassName({ variant: 'primary' })}
              >
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
