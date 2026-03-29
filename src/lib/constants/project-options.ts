import type { ProjectCategory, Platform, ShortlistGroup } from '@/types/domain'

export const platforms: Platform[] = ['iOS', 'Android', 'Web', 'Multi-platform']

export const projectCategories: ProjectCategory[] = [
  'Fintech',
  'E-commerce',
  'Productivity',
  'Health',
  'SaaS',
  'Marketplace',
  'Media',
  'Education',
]

export const shortlistGroups: ShortlistGroup[] = [
  'Standout flows',
  'Micro interactions',
  'Patterns to remix',
]

export const projectSections = [
  { label: 'Upload', href: 'upload' },
  { label: 'Library', href: 'library' },
  { label: 'Clusters', href: 'clusters' },
  { label: 'Shortlist', href: 'shortlist' },
] as const
