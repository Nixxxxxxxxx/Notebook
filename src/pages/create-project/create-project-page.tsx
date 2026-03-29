import { ArrowLeft, ArrowRight, FolderPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { ErrorState } from '@/components/states/error-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonClassName as buttonStyles } from '@/components/ui/button-styles'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createProject } from '@/features/projects/projects-service'
import { useAuth } from '@/hooks/use-auth'
import { platforms, projectCategories } from '@/lib/constants/project-options'

const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Project name should be at least 3 characters')
    .max(60, 'Keep the title under 60 characters'),
  platform: z.enum(platforms),
  category: z.enum(projectCategories),
  description: z.string().trim().max(240, 'Keep the description under 240 characters'),
})

type CreateProjectValues = z.infer<typeof createProjectSchema>

export function CreateProjectPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      platform: 'iOS',
      category: 'Fintech',
      description: '',
    },
  })

  if (!user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setError('')

    try {
      const project = await createProject(user.id, values)
      navigate(`/projects/${project.id}/upload`, { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not create project')
    }
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="surface-panel px-8 py-10">
        <Badge tone="accent">Create project</Badge>
        <h1 className="mt-6 font-display text-5xl text-text">Shape the board before the screenshots arrive.</h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          A focused name, platform, and category make the rest of the flow feel deliberate. Keep it tight, product-specific, and easy to scan later.
        </p>
            <div className="mt-8 space-y-4">
          {[
            'Start with one product or one research angle per board.',
            'Platform and category help keep the library filterable later.',
            'Short descriptions work better than big briefs at MVP stage.',
          ].map((tip) => (
            <div key={tip} className="rounded-[24px] bg-white/70 px-5 py-4 text-sm leading-6 text-muted">
              {tip}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge tone="neutral">Routes to upload</Badge>
          <Badge tone="neutral">Keeps metadata structured</Badge>
          <Badge tone="neutral">Prepares library filters</Badge>
        </div>
      </section>

      <section className="surface-card px-8 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">Project setup</p>
            <h2 className="mt-2 font-display text-4xl text-text">Create a new pattern board</h2>
          </div>
          <Link to="/dashboard" className={buttonStyles({ variant: 'ghost' })}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text">Project name</span>
            <Input placeholder="Finflow onboarding audit" error={Boolean(errors.name)} {...register('name')} />
            {errors.name ? (
              <span className="mt-2 block text-sm text-[#b85e46]">{errors.name.message}</span>
            ) : null}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text">Platform</span>
              <Select error={Boolean(errors.platform)} {...register('platform')}>
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text">Category</span>
              <Select error={Boolean(errors.category)} {...register('category')}>
                {projectCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-text">Description</span>
            <Textarea
              placeholder="What kind of references will live here? Keep it practical and easy to scan."
              error={Boolean(errors.description)}
              {...register('description')}
            />
            {errors.description ? (
              <span className="mt-2 block text-sm text-[#b85e46]">{errors.description.message}</span>
            ) : null}
          </label>

          <div className="rounded-[24px] bg-canvas px-5 py-5">
            <p className="text-sm font-semibold text-text">After creation</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              You land directly in upload, then the board becomes a searchable library with cluster suggestions generated from the incoming batch.
            </p>
          </div>

        {error ? (
            <ErrorState title="Project could not be created" description={error} />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/dashboard" className={buttonStyles({ variant: 'secondary' })}>
              Cancel
            </Link>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              <FolderPlus className="h-4 w-4" />
              {isSubmitting ? 'Creating project...' : 'Create and continue'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
