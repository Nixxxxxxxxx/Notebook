import type { Cluster, Screen } from '@/types/domain'
import { slugify } from '@/lib/utils/format'

interface ClusterSuggestion {
  title: string
  tags: string[]
}

const clusterPresets: ClusterSuggestion[] = [
  { title: 'Onboarding narrative', tags: ['entry', 'education'] },
  { title: 'Home and discovery', tags: ['overview', 'navigation'] },
  { title: 'Pricing and conversion', tags: ['decision', 'monetization'] },
  { title: 'Search and browse', tags: ['findability', 'explore'] },
  { title: 'Account and settings', tags: ['account', 'control'] },
]

const keywordSuggestions: Array<ClusterSuggestion & { keywords: string[] }> = [
  {
    title: 'Onboarding narrative',
    tags: ['entry', 'education'],
    keywords: ['welcome', 'intro', 'onboarding', 'start', 'signup'],
  },
  {
    title: 'Home and discovery',
    tags: ['overview', 'navigation'],
    keywords: ['home', 'dashboard', 'discover', 'feed', 'overview'],
  },
  {
    title: 'Pricing and conversion',
    tags: ['decision', 'monetization'],
    keywords: ['pricing', 'checkout', 'subscription', 'plan', 'pay'],
  },
  {
    title: 'Search and browse',
    tags: ['findability', 'explore'],
    keywords: ['search', 'results', 'filter', 'browse', 'explore'],
  },
  {
    title: 'Account and settings',
    tags: ['account', 'control'],
    keywords: ['profile', 'account', 'settings', 'preferences'],
  },
]

function matchSuggestion(name: string, index: number) {
  const lowerName = name.toLowerCase()
  const byKeyword = keywordSuggestions.find((preset) =>
    preset.keywords.some((keyword) => lowerName.includes(keyword)),
  )

  return byKeyword ?? clusterPresets[index % clusterPresets.length]
}

function createId(prefix: string, seed: string) {
  return `${prefix}-${slugify(seed)}-${Math.random().toString(36).slice(2, 8)}`
}

export function generateClusterSuggestions(projectId: string, screens: Screen[], offset = 0) {
  const groups = new Map<string, Screen[]>()
  const suggestions = new Map<string, ClusterSuggestion>()
  const duplicateGroups = new Map<string, number>()

  for (const screen of screens) {
    const signature = slugify(screen.name.replace(/\.[a-z0-9]+$/i, ''))
    duplicateGroups.set(signature, (duplicateGroups.get(signature) ?? 0) + 1)
  }

  screens.forEach((screen, index) => {
    const suggestion = matchSuggestion(screen.name, index + offset)
    const groupKey = suggestion.title
    const next = groups.get(groupKey) ?? []
    next.push(screen)
    groups.set(groupKey, next)
    suggestions.set(groupKey, suggestion)
  })

  const clusters: Cluster[] = []
  const screenUpdates = new Map<string, Pick<Screen, 'clusterId' | 'status'>>()

  Array.from(groups.entries()).forEach(([groupKey, groupedScreens], index) => {
    const suggestion = suggestions.get(groupKey) ?? clusterPresets[index % clusterPresets.length]
    const clusterId = createId('cluster', `${projectId}-${groupKey}-${index}`)
    const clusterStatus = groupedScreens.length > 1 ? 'suggested' : 'review_needed'
    const note =
      groupedScreens.length > 1
        ? 'Looks like a promising pattern family. Review the edge cases and keep the strongest references.'
        : 'Single-screen cluster. Keep it isolated for now or merge manually after review.'

    clusters.push({
      id: clusterId,
      projectId,
      title: suggestion.title,
      status: clusterStatus,
      confidence: Math.min(0.64 + index * 0.06, 0.93),
      tags: suggestion.tags,
      note,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    groupedScreens.forEach((screen) => {
      const signature = slugify(screen.name.replace(/\.[a-z0-9]+$/i, ''))
      const duplicateCount = duplicateGroups.get(signature) ?? 0
      const status =
        duplicateCount > 1 ? 'duplicate' : groupedScreens.length > 1 ? 'grouped' : 'ungrouped'

      screenUpdates.set(screen.id, {
        clusterId,
        status,
      })
    })
  })

  return { clusters, screenUpdates }
}
