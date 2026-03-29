import { appClient } from '@/lib/data/app-client'
import type { ShortlistGroup } from '@/types/domain'

export function addToShortlist(projectId: string, screenIds: string[], group: ShortlistGroup) {
  return appClient.addToShortlist(projectId, screenIds, group)
}

export function listShortlist(projectId: string) {
  return appClient.listShortlist(projectId)
}

export function updateShortlistItem(
  projectId: string,
  itemId: string,
  updates: Partial<{ group: ShortlistGroup; position: number; label: string }>,
) {
  return appClient.updateShortlistItem(projectId, itemId, updates)
}

export function removeShortlistItem(projectId: string, itemId: string) {
  return appClient.removeShortlistItem(projectId, itemId)
}
