import type { ReactNode } from 'react'
import { Layers3, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ProjectNav } from '@/components/navigation/project-nav'
import type { Project } from '@/types/domain'
import { formatDate } from '@/lib/utils/format'

interface ProjectWorkspaceHeaderProps {
  project: Project
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function ProjectWorkspaceHeader({
  project,
  eyebrow,
  title,
  description,
  actions,
}: ProjectWorkspaceHeaderProps) {
  return (
    <section className="surface-panel overflow-hidden px-8 py-10 sm:px-10">
      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{eyebrow}</Badge>
            <Badge tone="neutral">{project.platform}</Badge>
            <Badge tone="neutral">{project.category}</Badge>
          </div>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-5xl leading-[1.02] text-text">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{description}</p>
          <ProjectNav project={project} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <Card className="bg-white/80">
            <p className="text-sm text-muted">Project</p>
            <p className="mt-3 text-2xl font-semibold text-text">{project.name}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{project.description || 'No description yet.'}</p>
          </Card>
          <Card className="bg-white/80">
            <Layers3 className="h-4 w-4 text-accent" />
            <p className="mt-3 text-sm text-muted">Screens and clusters</p>
            <p className="mt-1 text-xl font-semibold text-text">
              {project.screenCount} screens · {project.clusterCount} clusters
            </p>
          </Card>
          <Card className="bg-white/80">
            <Star className="h-4 w-4 text-accent" />
            <p className="mt-3 text-sm text-muted">Last update</p>
            <p className="mt-1 text-xl font-semibold text-text">{formatDate(project.updatedAt)}</p>
            {actions ? <div className="mt-4">{actions}</div> : null}
          </Card>
        </div>
      </div>
    </section>
  )
}
