import { FileImage, FolderUp, LoaderCircle, Trash2, UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/states/error-state'
import { LoadingState } from '@/components/states/loading-state'
import { ProjectWorkspaceHeader } from '@/components/navigation/project-workspace-header'
import { Badge } from '@/components/ui/badge'
import { buttonClassName } from '@/components/ui/button-styles'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/ui/progress-bar'
import { getProject } from '@/features/projects/projects-service'
import { createUploadQueue, uploadScreens } from '@/features/uploads/uploads-service'
import type { Project } from '@/types/domain'

type UploadState = 'idle' | 'files_selected' | 'invalid' | 'uploading' | 'processing' | 'ready' | 'failed'

export function UploadPage() {
  const { projectId } = useParams()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [queue, setQueue] = useState<ReturnType<typeof createUploadQueue>>([])
  const [loading, setLoading] = useState(Boolean(projectId))
  const [error, setError] = useState('')
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!projectId) {
      return
    }

    void getProject(projectId)
      .then((result) => {
        setProject(result)
        if (!result) {
          setError('Project not found')
        }
      })
      .catch((reason) => {
        setError(reason instanceof Error ? reason.message : 'Could not load project')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [projectId])

  if (loading) {
    return (
      <LoadingState
        title="Preparing the upload surface"
        description="Loading project context and dropzone state."
      />
    )
  }

  if (!project || error) {
    return (
      <ErrorState
        title="Upload is unavailable"
        description={error || (!projectId ? 'Missing project id.' : 'The project could not be loaded.')}
        action={
          <Link to="/dashboard" className={buttonClassName({ variant: 'secondary' })}>
            Back to dashboard
          </Link>
        }
      />
    )
  }

  const validFiles = queue.filter((item) => item.status === 'ready').map((item) => item.file)
  const invalidFiles = queue.filter((item) => item.status === 'invalid')

  const addFiles = (files: FileList | File[]) => {
    const nextItems = createUploadQueue(Array.from(files))
    const merged = [...queue, ...nextItems]
    setQueue(merged)

    if (merged.some((item) => item.status === 'invalid')) {
      setState('invalid')
    } else if (merged.length > 0) {
      setState('files_selected')
    } else {
      setState('idle')
    }
  }

  const handleUpload = async () => {
    if (!projectId || validFiles.length === 0) {
      return
    }

    setState('uploading')
    setProgress(0)
    setError('')

    try {
      await uploadScreens(projectId, validFiles, (value) => {
        setProgress(Math.round(value * 100))
      })
      setState('processing')
      setProgress(100)
      window.setTimeout(() => {
        setState('ready')
      }, 600)
    } catch (reason) {
      setState('failed')
      setError(reason instanceof Error ? reason.message : 'Upload failed')
    }
  }

  return (
    <div className="space-y-6">
      <ProjectWorkspaceHeader
        project={project}
        eyebrow="Upload"
        title="Bring screenshots in as a structured batch."
        description="Drop a believable set of UI references, validate them before storage, then turn the batch into a project library and first-pass clusters."
        actions={
          <Link to={`/projects/${project.id}/library`} className={buttonClassName({ variant: 'secondary' })}>
            Open library
          </Link>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div
          className={`surface-card border-2 border-dashed p-8 transition ${dragging ? 'border-accent bg-accent/5' : 'border-line'}`}
          onDragEnter={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
              return
            }
            setDragging(false)
          }}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            if (event.dataTransfer.files.length > 0) {
              addFiles(event.dataTransfer.files)
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                addFiles(event.target.files)
              }
            }}
          />

          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-accentSoft text-accent">
              <UploadCloud className="h-9 w-9" />
            </div>
            <h2 className="mt-6 font-display text-4xl text-text">Drop screenshots or browse files</h2>
            <p className="mt-4 text-base leading-7 text-muted">
              PNG, JPG, and WebP are supported. Keep files under 12 MB each for the first MVP pass.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  inputRef.current?.click()
                }}
              >
                <FolderUp className="h-4 w-4" />
                Choose files
              </Button>
              {validFiles.length > 0 ? (
                <Button type="button" size="lg" variant="secondary" onClick={() => void handleUpload()}>
                  {state === 'uploading' || state === 'processing' ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileImage className="h-4 w-4" />
                  )}
                  {state === 'uploading' || state === 'processing'
                    ? 'Uploading batch...'
                    : `Upload ${validFiles.length} file${validFiles.length === 1 ? '' : 's'}`}
                </Button>
              ) : null}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <p className="text-sm text-muted">Queue</p>
                <p className="mt-1 text-2xl font-semibold text-text">{queue.length}</p>
              </div>
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <p className="text-sm text-muted">Valid</p>
                <p className="mt-1 text-2xl font-semibold text-text">{validFiles.length}</p>
              </div>
              <div className="rounded-[22px] bg-canvas px-4 py-4">
                <p className="text-sm text-muted">Rejected</p>
                <p className="mt-1 text-2xl font-semibold text-text">{invalidFiles.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Batch status</p>
                <h3 className="mt-2 text-2xl font-semibold text-text">
                  {state === 'idle' && 'Waiting for files'}
                  {state === 'files_selected' && 'Files selected'}
                  {state === 'invalid' && 'Some files need attention'}
                  {state === 'uploading' && 'Uploading to storage'}
                  {state === 'processing' && 'Generating first-pass clusters'}
                  {state === 'ready' && 'Batch is ready'}
                  {state === 'failed' && 'Upload failed'}
                </h3>
              </div>
              <Badge tone={state === 'ready' ? 'success' : state === 'failed' ? 'warning' : 'accent'}>
                {state.replace(/_/g, ' ')}
              </Badge>
            </div>

            <p className="mt-4 text-base leading-7 text-muted">
              {state === 'processing'
                ? 'The upload is complete and the placeholder grouping pass is creating believable clusters.'
                : state === 'ready'
                  ? 'Your files are in the library and ready for cluster review.'
                  : 'Queue files here, remove weak inputs, and keep the first batch sharp.'}
            </p>

            {(state === 'uploading' || state === 'processing' || state === 'ready') ? (
              <div className="mt-6">
                <ProgressBar value={progress} />
                <p className="mt-2 text-sm text-muted">{progress}% complete</p>
              </div>
            ) : null}

            {state === 'ready' ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={`/projects/${project.id}/library`} className={buttonClassName({ variant: 'primary' })}>
                  Open library
                </Link>
                <Link to={`/projects/${project.id}/clusters`} className={buttonClassName({ variant: 'secondary' })}>
                  Review clusters
                </Link>
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-[22px] bg-[rgba(184,114,52,0.08)] p-4 text-sm leading-6 text-warning">
                {error}
              </div>
            ) : null}
          </div>

          <div className="surface-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Queue</p>
                <h3 className="mt-2 text-2xl font-semibold text-text">Files in this batch</h3>
              </div>
              {queue.length > 0 ? (
                <Button type="button" variant="ghost" onClick={() => setQueue([])}>
                  Clear
                </Button>
              ) : null}
            </div>

            {queue.length === 0 ? (
              <p className="mt-6 text-base leading-7 text-muted">
                Nothing queued yet. Drag a selection into the dropzone or use the file picker.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {queue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[20px] border border-line bg-canvas/70 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-text">{item.file.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                        {item.reason ? ` · ${item.reason}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={item.status === 'ready' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                      <button
                        type="button"
                        className="rounded-full p-2 text-muted transition hover:bg-white hover:text-text"
                        onClick={() => {
                          const next = queue.filter((entry) => entry.id !== item.id)
                          setQueue(next)
                          if (next.length === 0) {
                            setState('idle')
                          } else if (next.some((entry) => entry.status === 'invalid')) {
                            setState('invalid')
                          } else {
                            setState('files_selected')
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
