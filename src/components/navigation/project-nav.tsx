import { NavLink } from 'react-router-dom'

import { cn } from '@/lib/utils/cn'
import { projectSections } from '@/lib/constants/project-options'
import type { Project } from '@/types/domain'

interface ProjectNavProps {
  project: Project
}

export function ProjectNav({ project }: ProjectNavProps) {
  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {projectSections.map((section) => (
        <NavLink
          key={section.href}
          to={`/projects/${project.id}/${section.href}`}
          className={({ isActive }) =>
            cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              isActive
                ? 'bg-accent text-white shadow-glow'
                : 'bg-white/75 text-muted hover:bg-white hover:text-text',
            )
          }
        >
          {section.label}
        </NavLink>
      ))}
    </nav>
  )
}
