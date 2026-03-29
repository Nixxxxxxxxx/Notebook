const MAX_FILE_SIZE = 12 * 1024 * 1024
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

export interface FileValidationResult {
  valid: boolean
  reason?: string
}

export function validateImageFile(file: File): FileValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return { valid: false, reason: 'Unsupported file type' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: 'File is larger than 12 MB' }
  }

  return { valid: true }
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Could not read ${file.name}`))
    reader.readAsDataURL(file)
  })
}
