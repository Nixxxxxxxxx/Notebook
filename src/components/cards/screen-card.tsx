import type { ReactNode } from 'react'
import { Check, ImageOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Screen } from '@/types/domain'
import { formatDate } from '@/lib/utils/format'

interface ScreenCardProps {
  screen: Screen
  selected?: boolean
  onToggle?: (screenId: string) => void
  footer?: ReactNode
}

const statusToneMap: Record<Screen['status'], 'accent' | 'warning' | 'success'> = {
  grouped: 'success',
  ungrouped: 'warning',
  duplicate: 'accent',
}

export function ScreenCard({ screen, selected = false, onToggle, footer }: ScreenCardProps) {
  return (
    <article
      className={cn(
        'surface-card overflow-hidden p-0 transition duration-200',
        selected ? 'ring-2 ring-accent/30' : '',
      )}
    >
      <button
        type="button"
        onClick={() => onToggle?.(screen.id)}
        className="group block w-full text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
          {screen.thumbnailUrl ? (
            <img
              src={screen.thumbnailUrl}
              alt={screen.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className="h-8 w-8 text-muted" />
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Badge tone={statusToneMap[screen.status]}>{screen.status}</Badge>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/80 transition',
                selected ? 'text-accent' : 'text-transparent',
              )}
            >
              <Check className="h-4 w-4" />
            </div>
          </div>
        </div>
      </button>

      <div className="space-y-4 p-5">
        <div>
          <p className="line-clamp-1 text-lg font-semibold text-text">{screen.name}</p>
          <p className="mt-1 text-sm text-muted">Added {formatDate(screen.createdAt)}</p>
        </div>
        {footer ? <div>{footer}</div> : null}
      </div>
    </article>
  )
}
