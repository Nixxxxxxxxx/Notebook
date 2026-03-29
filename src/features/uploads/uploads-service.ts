import { appClient } from '@/lib/data/app-client'
import { validateImageFile } from '@/lib/utils/file'

export interface UploadQueueItem {
  id: string
  file: File
  status: 'ready' | 'invalid'
  reason?: string
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

export function createUploadQueue(files: File[]) {
  return files.map((file) => {
    const validation = validateImageFile(file)

    return {
      id: createId('queue'),
      file,
      status: validation.valid ? 'ready' : 'invalid',
      reason: validation.reason,
    } satisfies UploadQueueItem
  })
}

export function uploadScreens(
  projectId: string,
  files: File[],
  onProgress?: (value: number) => void,
) {
  return appClient.uploadScreens(projectId, files, onProgress)
}
