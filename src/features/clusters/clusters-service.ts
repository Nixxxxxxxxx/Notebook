import { appClient } from '@/lib/data/app-client'
import type { Cluster } from '@/types/domain'

export function listClusters(projectId: string) {
  return appClient.listClusters(projectId)
}

export function getCluster(projectId: string, clusterId: string) {
  return appClient.getCluster(projectId, clusterId)
}

export function updateCluster(clusterId: string, updates: Partial<Cluster>) {
  return appClient.updateCluster(clusterId, updates)
}

export function moveScreen(screenId: string, targetClusterId: string | null) {
  return appClient.moveScreen(screenId, targetClusterId)
}

export function mergeClusters(projectId: string, sourceClusterId: string, targetClusterId: string) {
  return appClient.mergeClusters(projectId, sourceClusterId, targetClusterId)
}

export function splitCluster(projectId: string, clusterId: string) {
  return appClient.splitCluster(projectId, clusterId)
}
