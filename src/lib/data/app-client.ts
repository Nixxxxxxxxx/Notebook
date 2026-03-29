import type {
  AuthUser,
  ClusterStatus,
  Cluster,
  CreateProjectInput,
  ProjectCategory,
  Platform,
  Project,
  Screen,
  ScreenStatus,
  ShortlistEntry,
  ShortlistGroup,
  UploadResult,
} from '@/types/domain'
import {
  addToShortlist as addToShortlistDemo,
  createProject as createProjectDemo,
  ensureDemoSeed,
  getCluster as getClusterDemo,
  getProject as getProjectDemo,
  listClusters as listClustersDemo,
  listProjects as listProjectsDemo,
  listScreens as listScreensDemo,
  listShortlist as listShortlistDemo,
  mergeClusters as mergeClustersDemo,
  moveScreen as moveScreenDemo,
  removeShortlistItem as removeShortlistItemDemo,
  splitCluster as splitClusterDemo,
  updateCluster as updateClusterDemo,
  updateShortlistItem as updateShortlistItemDemo,
  uploadScreens as uploadScreensDemo,
} from '@/lib/data/demo-store'
import { getAppUrl, isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type ProjectRow = Database['public']['Tables']['projects']['Row']
type ScreenRow = Database['public']['Tables']['screens']['Row']
type ClusterRow = Database['public']['Tables']['clusters']['Row']

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function hydrateProject(
  row: ProjectRow,
  counts: { screenCount: number; clusterCount: number; shortlistCount: number },
) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    platform: row.platform as Platform,
    category: row.category as ProjectCategory,
    description: row.description ?? '',
    coverImageUrl: row.cover_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...counts,
  } satisfies Project
}

function hydrateCluster(row: ClusterRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    status: row.status as ClusterStatus,
    confidence: Number(row.confidence),
    tags: row.tags ?? [],
    note: row.note ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies Cluster
}

function hydrateScreen(row: ScreenRow, clusterId: string | null) {
  return {
    id: row.id,
    projectId: row.project_id,
    batchId: row.batch_id,
    name: row.name,
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
    status: row.status as ScreenStatus,
    source: row.source as 'upload' | 'demo',
    clusterId,
    createdAt: row.created_at,
    width: row.width,
    height: row.height,
  } satisfies Screen
}

async function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase client is not configured')
  }

  return supabase
}

async function getClusterAssignments(client: NonNullable<typeof supabase>, screenIds: string[]) {
  if (screenIds.length === 0) {
    return new Map<string, string>()
  }

  const { data, error } = await client
    .from('cluster_screens')
    .select('cluster_id, screen_id')
    .in('screen_id', screenIds)

  if (error) {
    throw error
  }

  const rows = (data ?? []) as Array<{ screen_id: string; cluster_id: string }>
  return new Map(rows.map((item) => [item.screen_id, item.cluster_id]))
}

async function computeCounts(client: NonNullable<typeof supabase>, projectId: string) {
  const [{ data: screens }, { data: clusters }, { data: shortlist }] = await Promise.all([
    client.from('screens').select('id').eq('project_id', projectId),
    client.from('clusters').select('id').eq('project_id', projectId),
    client.from('shortlist_items').select('id').eq('project_id', projectId),
  ])

  return {
    screenCount: screens?.length ?? 0,
    clusterCount: clusters?.length ?? 0,
    shortlistCount: shortlist?.length ?? 0,
  }
}

async function uploadToSupabase(
  projectId: string,
  files: File[],
  onProgress?: (value: number) => void,
) {
  const client = await requireSupabase()
  const batchId = createId('batch')
  const createdAt = new Date().toISOString()

  const { error: batchError } = await client.from('batches').insert({
    id: batchId,
    project_id: projectId,
    status: 'uploading',
    created_at: createdAt,
  })

  if (batchError) {
    throw batchError
  }

  const screenRows: Screen[] = []

  for (const [index, file] of files.entries()) {
    const path = `${projectId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await client.storage.from('screens').upload(path, file, {
      upsert: false,
      contentType: file.type,
    })

    if (uploadError) {
      throw uploadError
    }

    const { data } = client.storage.from('screens').getPublicUrl(path)
    const screenId = createId('screen')
    const insertedAt = new Date().toISOString()
    const { error: screenError } = await client.from('screens').insert({
      id: screenId,
      project_id: projectId,
      batch_id: batchId,
      name: file.name,
      image_url: data.publicUrl,
      thumbnail_url: data.publicUrl,
      file_size: file.size,
      width: null,
      height: null,
      status: 'ungrouped',
      source: 'upload',
      created_at: insertedAt,
    })

    if (screenError) {
      throw screenError
    }

    screenRows.push({
      id: screenId,
      projectId,
      batchId,
      name: file.name,
      imageUrl: data.publicUrl,
      thumbnailUrl: data.publicUrl,
      status: 'ungrouped',
      source: 'upload',
      clusterId: null,
      createdAt: insertedAt,
      width: null,
      height: null,
    })

    onProgress?.((index + 1) / files.length)
  }

  const { data: existingClusters } = await client
    .from('clusters')
    .select('id')
    .eq('project_id', projectId)
  const { clusters, screenUpdates } = await import('@/lib/data/cluster-generator').then(
    ({ generateClusterSuggestions }) =>
      generateClusterSuggestions(projectId, screenRows, existingClusters?.length ?? 0),
  )

  if (clusters.length > 0) {
    const { error: clusterError } = await client.from('clusters').insert(
      clusters.map((cluster) => ({
        id: cluster.id,
        project_id: cluster.projectId,
        title: cluster.title,
        status: cluster.status,
        confidence: cluster.confidence,
        tags: cluster.tags,
        note: cluster.note,
        created_at: cluster.createdAt,
        updated_at: cluster.updatedAt,
      })),
    )

    if (clusterError) {
      throw clusterError
    }
  }

  const assignments = Array.from(screenUpdates.entries())
    .filter(([, value]) => Boolean(value.clusterId))
    .map(([screenId, value]) => ({
      cluster_id: value.clusterId as string,
      screen_id: screenId,
    }))

  if (assignments.length > 0) {
    const { error: assignmentError } = await client.from('cluster_screens').upsert(assignments)
    if (assignmentError) {
      throw assignmentError
    }
  }

  for (const [screenId, value] of screenUpdates.entries()) {
    const { error: updateError } = await client
      .from('screens')
      .update({ status: value.status })
      .eq('id', screenId)

    if (updateError) {
      throw updateError
    }
  }

  const { error: batchReadyError } = await client
    .from('batches')
    .update({ status: 'ready' })
    .eq('id', batchId)

  if (batchReadyError) {
    throw batchReadyError
  }

  return {
    batch: {
      id: batchId,
      projectId,
      status: 'ready',
      createdAt,
    },
    screens: screenRows.map((screen) => ({
      ...screen,
      ...screenUpdates.get(screen.id),
    })),
    clusters,
  } satisfies UploadResult
}

async function listProjectsSupabase(userId: string) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  const projects = await Promise.all(
    ((data ?? []) as ProjectRow[]).map(async (row) =>
      hydrateProject(row, await computeCounts(client, row.id)),
    ),
  )

  return projects
}

async function getProjectSupabase(projectId: string) {
  const client = await requireSupabase()
  const { data, error } = await client.from('projects').select('*').eq('id', projectId).single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }

    throw error
  }

  return hydrateProject(data as ProjectRow, await computeCounts(client, projectId))
}

async function createProjectSupabase(userId: string, input: CreateProjectInput) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('projects')
    .insert({
      user_id: userId,
      name: input.name,
      platform: input.platform,
      category: input.category,
      description: input.description,
      cover_image_url: null,
    })
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return hydrateProject(data as ProjectRow, {
    screenCount: 0,
    clusterCount: 0,
    shortlistCount: 0,
  })
}

async function listScreensSupabase(projectId: string) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('screens')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const assignments = await getClusterAssignments(
    client,
    ((data ?? []) as ScreenRow[]).map((screen) => screen.id),
  )

  return ((data ?? []) as ScreenRow[]).map((row) =>
    hydrateScreen(row, assignments.get(row.id) ?? null),
  )
}

async function listClustersSupabase(projectId: string) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('clusters')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as ClusterRow[]).map(hydrateCluster)
}

async function getClusterSupabase(projectId: string, clusterId: string) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('clusters')
    .select('*')
    .eq('project_id', projectId)
    .eq('id', clusterId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return hydrateCluster(data as ClusterRow)
}

async function updateClusterSupabase(clusterId: string, updates: Partial<Cluster>) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('clusters')
    .update({
      title: updates.title,
      status: updates.status,
      confidence: updates.confidence,
      tags: updates.tags,
      note: updates.note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', clusterId)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return hydrateCluster(data as ClusterRow)
}

async function moveScreenSupabase(screenId: string, targetClusterId: string | null) {
  const client = await requireSupabase()
  await client.from('cluster_screens').delete().eq('screen_id', screenId)

  if (targetClusterId) {
    const { error } = await client.from('cluster_screens').insert({
      cluster_id: targetClusterId,
      screen_id: screenId,
    })

    if (error) {
      throw error
    }
  }

  const { error: screenError } = await client
    .from('screens')
    .update({ status: targetClusterId ? 'grouped' : 'ungrouped' })
    .eq('id', screenId)

  if (screenError) {
    throw screenError
  }
}

async function mergeClustersSupabase(projectId: string, sourceClusterId: string, targetClusterId: string) {
  const client = await requireSupabase()
  const { data, error } = await client
    .from('cluster_screens')
    .select('screen_id')
    .eq('cluster_id', sourceClusterId)

  if (error) {
    throw error
  }

  await client.from('cluster_screens').delete().eq('cluster_id', sourceClusterId)
  await client.from('clusters').delete().eq('id', sourceClusterId).eq('project_id', projectId)

  const assignments = (data ?? []) as Array<{ screen_id: string }>

  if (assignments.length > 0) {
    const { error: insertError } = await client.from('cluster_screens').upsert(
      assignments.map((item) => ({
        cluster_id: targetClusterId,
        screen_id: item.screen_id,
      })),
    )

    if (insertError) {
      throw insertError
    }

    const { error: updateScreensError } = await client
      .from('screens')
      .update({ status: 'grouped' })
      .in(
        'id',
        assignments.map((item) => item.screen_id),
      )

    if (updateScreensError) {
      throw updateScreensError
    }
  }

  await client
    .from('clusters')
    .update({ status: 'edited', updated_at: new Date().toISOString() })
    .eq('id', targetClusterId)
}

async function splitClusterSupabase(projectId: string, clusterId: string) {
  const client = await requireSupabase()
  const [{ data: screens }, { data: cluster }] = await Promise.all([
    client.from('cluster_screens').select('screen_id').eq('cluster_id', clusterId),
    client.from('clusters').select('*').eq('id', clusterId).eq('project_id', projectId).single(),
  ])

  if (!cluster) {
    return
  }

  await client.from('cluster_screens').delete().eq('cluster_id', clusterId)
  await client.from('clusters').delete().eq('id', clusterId)

  for (const entry of ((screens ?? []) as Array<{ screen_id: string }>)) {
    const newClusterId = createId('cluster')
    const createdAt = new Date().toISOString()
    await client.from('clusters').insert({
      id: newClusterId,
      project_id: projectId,
      title: `Review ${newClusterId.slice(-4)}`,
      status: 'review_needed',
      confidence: 0.55,
      tags: ['needs review'],
      note: 'Split from a larger cluster. Review manually and regroup if needed.',
      created_at: createdAt,
      updated_at: createdAt,
    })
    await client.from('cluster_screens').insert({
      cluster_id: newClusterId,
      screen_id: entry.screen_id,
    })
    await client.from('screens').update({ status: 'ungrouped' }).eq('id', entry.screen_id)
  }
}

async function addToShortlistSupabase(projectId: string, screenIds: string[], group: ShortlistGroup) {
  const client = await requireSupabase()
  const { data: existing, error } = await client
    .from('shortlist_items')
    .select('*')
    .eq('project_id', projectId)

  if (error) {
    throw error
  }

  const existingRows = (existing ?? []) as Array<{ screen_id: string; group_name: string }>
  const existingScreenIds = new Set(existingRows.map((item) => item.screen_id))
  const currentGroupCount = existingRows.filter((item) => item.group_name === group).length
  let position = currentGroupCount

  const inserts = screenIds
    .filter((screenId) => !existingScreenIds.has(screenId))
    .map((screenId) => ({
      id: createId('shortlist'),
      project_id: projectId,
      screen_id: screenId,
      label: 'Saved from compare',
      group_name: group,
      position: position++,
    }))

  if (inserts.length === 0) {
    return
  }

  const { error: insertError } = await client.from('shortlist_items').insert(inserts)
  if (insertError) {
    throw insertError
  }
}

async function listShortlistSupabase(projectId: string) {
  const client = await requireSupabase()
  const { data: shortlistRows, error } = await client
    .from('shortlist_items')
    .select('*')
    .eq('project_id', projectId)
    .order('group_name', { ascending: true })
    .order('position', { ascending: true })

  if (error) {
    throw error
  }

  const shortlist = (shortlistRows ?? []) as Array<{
    id: string
    project_id: string
    screen_id: string
    label: string | null
    group_name: string
    position: number
    created_at: string
  }>
  const screenIds = shortlist.map((item) => item.screen_id)
  const { data: screenRows, error: screensError } = await client
    .from('screens')
    .select('*')
    .in('id', screenIds)

  if (screensError) {
    throw screensError
  }

  const assignments = await getClusterAssignments(client, screenIds)
  const screensById = new Map(
    ((screenRows ?? []) as ScreenRow[]).map((screen) => [
      screen.id,
      hydrateScreen(screen, assignments.get(screen.id) ?? null),
    ]),
  )

  return shortlist.flatMap((row) => {
    const screen = screensById.get(row.screen_id)

    if (!screen) {
      return []
    }

    return [
      {
        id: row.id,
        projectId: row.project_id,
        screenId: row.screen_id,
        label: row.label ?? 'Saved reference',
        group: row.group_name as ShortlistGroup,
        position: row.position,
        createdAt: row.created_at,
        screen,
      } satisfies ShortlistEntry,
    ]
  })
}

async function updateShortlistItemSupabase(
  projectId: string,
  itemId: string,
  updates: Partial<{ group: ShortlistGroup; position: number; label: string }>,
) {
  const client = await requireSupabase()
  const { error } = await client
    .from('shortlist_items')
    .update({
      group_name: updates.group,
      position: updates.position,
      label: updates.label,
    })
    .eq('project_id', projectId)
    .eq('id', itemId)

  if (error) {
    throw error
  }
}

async function removeShortlistItemSupabase(projectId: string, itemId: string) {
  const client = await requireSupabase()
  const { error } = await client
    .from('shortlist_items')
    .delete()
    .eq('project_id', projectId)
    .eq('id', itemId)

  if (error) {
    throw error
  }
}

export const appClient = {
  mode: isSupabaseConfigured ? 'supabase' : 'demo',
  async ensureSeedData(user: AuthUser) {
    if (!isSupabaseConfigured) {
      ensureDemoSeed(user)
    }
  },
  listProjects(userId: string) {
    return isSupabaseConfigured ? listProjectsSupabase(userId) : listProjectsDemo(userId)
  },
  getProject(projectId: string) {
    return isSupabaseConfigured ? getProjectSupabase(projectId) : getProjectDemo(projectId)
  },
  createProject(userId: string, input: CreateProjectInput) {
    return isSupabaseConfigured
      ? createProjectSupabase(userId, input)
      : createProjectDemo(userId, input)
  },
  listScreens(projectId: string) {
    return isSupabaseConfigured ? listScreensSupabase(projectId) : listScreensDemo(projectId)
  },
  uploadScreens(projectId: string, files: File[], onProgress?: (value: number) => void) {
    return isSupabaseConfigured
      ? uploadToSupabase(projectId, files, onProgress)
      : uploadScreensDemo(projectId, files, onProgress)
  },
  listClusters(projectId: string) {
    return isSupabaseConfigured ? listClustersSupabase(projectId) : listClustersDemo(projectId)
  },
  getCluster(projectId: string, clusterId: string) {
    return isSupabaseConfigured
      ? getClusterSupabase(projectId, clusterId)
      : getClusterDemo(projectId, clusterId)
  },
  updateCluster(clusterId: string, updates: Partial<Cluster>) {
    return isSupabaseConfigured
      ? updateClusterSupabase(clusterId, updates)
      : updateClusterDemo(clusterId, updates)
  },
  moveScreen(screenId: string, targetClusterId: string | null) {
    return isSupabaseConfigured
      ? moveScreenSupabase(screenId, targetClusterId)
      : moveScreenDemo(screenId, targetClusterId)
  },
  mergeClusters(projectId: string, sourceClusterId: string, targetClusterId: string) {
    return isSupabaseConfigured
      ? mergeClustersSupabase(projectId, sourceClusterId, targetClusterId)
      : mergeClustersDemo(projectId, sourceClusterId, targetClusterId)
  },
  splitCluster(projectId: string, clusterId: string) {
    return isSupabaseConfigured
      ? splitClusterSupabase(projectId, clusterId)
      : splitClusterDemo(projectId, clusterId)
  },
  addToShortlist(projectId: string, screenIds: string[], group: ShortlistGroup) {
    return isSupabaseConfigured
      ? addToShortlistSupabase(projectId, screenIds, group)
      : addToShortlistDemo(projectId, screenIds, group)
  },
  listShortlist(projectId: string) {
    return isSupabaseConfigured ? listShortlistSupabase(projectId) : listShortlistDemo(projectId)
  },
  updateShortlistItem(
    projectId: string,
    itemId: string,
    updates: Partial<{ group: ShortlistGroup; position: number; label: string }>,
  ) {
    return isSupabaseConfigured
      ? updateShortlistItemSupabase(projectId, itemId, updates)
      : updateShortlistItemDemo(projectId, itemId, updates)
  },
  removeShortlistItem(projectId: string, itemId: string) {
    return isSupabaseConfigured
      ? removeShortlistItemSupabase(projectId, itemId)
      : removeShortlistItemDemo(projectId, itemId)
  },
  getAuthRedirectUrl() {
    return `${getAppUrl()}/auth/callback`
  },
}
