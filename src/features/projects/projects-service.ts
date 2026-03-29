import { appClient } from '@/lib/data/app-client'
import type { CreateProjectInput } from '@/types/domain'

export function listProjects(userId: string) {
  return appClient.listProjects(userId)
}

export function getProject(projectId: string) {
  return appClient.getProject(projectId)
}

export function createProject(userId: string, input: CreateProjectInput) {
  return appClient.createProject(userId, input)
}
