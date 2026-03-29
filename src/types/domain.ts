export type Platform = 'iOS' | 'Android' | 'Web' | 'Multi-platform'
export type ProjectCategory =
  | 'Fintech'
  | 'E-commerce'
  | 'Productivity'
  | 'Health'
  | 'SaaS'
  | 'Marketplace'
  | 'Media'
  | 'Education'
export type ScreenStatus = 'grouped' | 'ungrouped' | 'duplicate'
export type ClusterStatus = 'suggested' | 'edited' | 'review_needed'
export type BatchStatus = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed'
export type ShortlistGroup = 'Standout flows' | 'Micro interactions' | 'Patterns to remix'

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface Project {
  id: string
  userId: string
  name: string
  platform: Platform
  category: ProjectCategory
  description: string
  coverImageUrl: string | null
  createdAt: string
  updatedAt: string
  screenCount: number
  clusterCount: number
  shortlistCount: number
}

export interface CreateProjectInput {
  name: string
  platform: Platform
  category: ProjectCategory
  description: string
}

export interface Batch {
  id: string
  projectId: string
  status: BatchStatus
  createdAt: string
}

export interface Screen {
  id: string
  projectId: string
  batchId: string | null
  name: string
  imageUrl: string
  thumbnailUrl: string
  status: ScreenStatus
  source: 'upload' | 'demo'
  clusterId: string | null
  createdAt: string
  width: number | null
  height: number | null
}

export interface Cluster {
  id: string
  projectId: string
  title: string
  status: ClusterStatus
  confidence: number
  tags: string[]
  note: string
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  projectId: string
  clusterId: string | null
  body: string
  createdAt: string
  updatedAt: string
}

export interface ShortlistItem {
  id: string
  projectId: string
  screenId: string
  label: string
  group: ShortlistGroup
  position: number
  createdAt: string
}

export interface ShortlistEntry extends ShortlistItem {
  screen: Screen
}

export interface UploadResult {
  batch: Batch
  screens: Screen[]
  clusters: Cluster[]
}
