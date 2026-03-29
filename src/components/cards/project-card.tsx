import { ArrowRight, FolderKanban, Layers3, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { buttonClassName } from '@/components/ui/button-styles'
import type { Project } from '@/types/domain'
import { formatCount, formatRelativeDate } from '@/lib/utils/format'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="surface-card overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-64 overflow-hidden bg-[linear-gradient(145deg,rgba(241,128,48,0.16),rgba(255,255,255,0.24))] p-6">
          {project.coverImageUrl ? (
            <img
              src={project.coverImageUrl}
              alt={project.name}
              className="h-full min-h-64 w-full rounded-[26px] border border-white/80 object-cover shadow-soft"
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center rounded-[26px] border border-dashed border-white/80 bg-white/55">
              <div className="text-center">
                <Badge tone="accent">Fresh board</Badge>
                <p className="mt-4 max-w-xs text-base leading-7 text-muted">
                  This project is ready for its first upload batch and cluster pass.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="neutral">{project.platform}</Badge>
              <Badge tone="accent">{project.category}</Badge>
            </div>
            <h3 className="mt-5 text-balance font-display text-3xl text-text">{project.name}</h3>
            <p className="mt-3 text-base leading-7 text-muted">
              {project.description || 'A focused pattern board ready for uploads, comparisons, and shortlist curation.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <FolderKanban className="h-4 w-4 text-accent" />
                <p className="mt-3 text-sm text-muted">Screens</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {formatCount(project.screenCount, 'screen')}
                </p>
              </div>
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <Layers3 className="h-4 w-4 text-accent" />
                <p className="mt-3 text-sm text-muted">Clusters</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {formatCount(project.clusterCount, 'cluster')}
                </p>
              </div>
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <Star className="h-4 w-4 text-accent" />
                <p className="mt-3 text-sm text-muted">Shortlist</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {formatCount(project.shortlistCount, 'pick')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">Updated {formatRelativeDate(project.updatedAt)}</p>
            <Link
              to={project.screenCount > 0 ? `/projects/${project.id}/library` : `/projects/${project.id}/upload`}
              className={buttonClassName({ variant: 'primary' })}
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
