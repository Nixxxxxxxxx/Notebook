import { appClient } from '@/lib/data/app-client'

export function listScreens(projectId: string) {
  return appClient.listScreens(projectId)
}
