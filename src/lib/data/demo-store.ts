import type {
  AuthUser,
  Batch,
  Cluster,
  ClusterStatus,
  CreateProjectInput,
  Project,
  Screen,
  ScreenStatus,
  ShortlistEntry,
  ShortlistGroup,
  ShortlistItem,
  UploadResult,
} from '@/types/domain'
import { generateClusterSuggestions } from '@/lib/data/cluster-generator'
import { readFileAsDataUrl } from '@/lib/utils/file'

interface DemoStore {
  projects: Project[]
  batches: Batch[]
  screens: Screen[]
  clusters: Cluster[]
  shortlistItems: ShortlistItem[]
}

const STORE_KEY = 'pattern-miner-demo-store-v1'

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function now() {
  return new Date().toISOString()
}

function createPreview(label: string, accent: string, tint: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="720" y2="960" gradientUnits="userSpaceOnUse">
          <stop stop-color="${accent}" />
          <stop offset="1" stop-color="${tint}" />
        </linearGradient>
      </defs>
      <rect width="720" height="960" rx="56" fill="#FFF8F2" />
      <rect x="28" y="28" width="664" height="904" rx="44" fill="url(#g)" opacity="0.18" />
      <rect x="72" y="96" width="576" height="120" rx="30" fill="white" fill-opacity="0.86" />
      <rect x="72" y="264" width="576" height="252" rx="32" fill="white" fill-opacity="0.74" />
      <rect x="72" y="560" width="272" height="232" rx="28" fill="white" fill-opacity="0.78" />
      <rect x="376" y="560" width="272" height="232" rx="28" fill="white" fill-opacity="0.78" />
      <text x="92" y="164" fill="#1A140F" font-family="Manrope, Arial, sans-serif" font-size="32" font-weight="800">${label}</text>
      <text x="92" y="212" fill="#6E6259" font-family="Manrope, Arial, sans-serif" font-size="20">Pattern Miner demo screen</text>
      <text x="92" y="472" fill="#4A3E35" font-family="Fraunces, Georgia, serif" font-size="54" font-weight="700">Refined UI patterns</text>
      <text x="92" y="774" fill="#6E6259" font-family="Manrope, Arial, sans-serif" font-size="22">Saved for clustering, compare, and shortlist</text>
    </svg>
  `.trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function createSeedProject(user: AuthUser) {
  const projectId = createId('project')
  const batchId = createId('batch')
  const createdAt = now()
  const screens: Screen[] = [
    ['Welcome pulse', '#F18331', '#F7C18A'],
    ['Goal picker', '#E19B5C', '#F5D3A5'],
    ['Permissions step', '#C98140', '#ECC4A8'],
    ['Success handoff', '#C95E2A', '#EDB28F'],
    ['Home feed', '#F2A94E', '#F6D495'],
    ['Performance cards', '#D87642', '#F1BB86'],
    ['Activity detail', '#E48954', '#F6CFA8'],
    ['Profile moodboard', '#B86A38', '#E7B38E'],
    ['Pricing hero', '#F1974C', '#F5C27D'],
    ['Plan comparison', '#D98041', '#F0C19A'],
    ['Checkout confidence', '#F07A3C', '#EFC39A'],
    ['Receipt glow', '#C46D3D', '#ECC3A6'],
  ].map(([label, accent, tint]) => ({
    id: createId('screen'),
    projectId,
    batchId,
    name: `${label}.png`,
    imageUrl: createPreview(label, accent, tint),
    thumbnailUrl: createPreview(label, accent, tint),
    status: 'ungrouped',
    source: 'demo',
    clusterId: null,
    createdAt,
    width: 720,
    height: 960,
  }))

  const { clusters, screenUpdates } = generateClusterSuggestions(projectId, screens)
  const hydratedScreens = screens.map((screen) => ({
    ...screen,
    ...screenUpdates.get(screen.id),
  }))
  const coverImageUrl = hydratedScreens[0]?.thumbnailUrl ?? null
  const shortlistItems: ShortlistItem[] = [
    {
      id: createId('shortlist'),
      projectId,
      screenId: hydratedScreens[0].id,
      label: 'Welcoming hero rhythm',
      group: 'Standout flows',
      position: 0,
      createdAt,
    },
    {
      id: createId('shortlist'),
      projectId,
      screenId: hydratedScreens[4].id,
      label: 'Card density reference',
      group: 'Micro interactions',
      position: 1,
      createdAt,
    },
    {
      id: createId('shortlist'),
      projectId,
      screenId: hydratedScreens[8].id,
      label: 'Paywall hierarchy',
      group: 'Patterns to remix',
      position: 2,
      createdAt,
    },
  ]

  return {
    project: {
      id: projectId,
      userId: user.id,
      name: 'Spring design audit',
      platform: 'iOS',
      category: 'Fintech',
      description:
        'A working board for onboarding, dashboard, and paywall references across mobile finance products.',
      coverImageUrl,
      createdAt,
      updatedAt: createdAt,
      screenCount: hydratedScreens.length,
      clusterCount: clusters.length,
      shortlistCount: shortlistItems.length,
    } satisfies Project,
    batch: {
      id: batchId,
      projectId,
      status: 'ready',
      createdAt,
    } satisfies Batch,
    screens: hydratedScreens,
    clusters,
    shortlistItems,
  }
}

function readStore(): DemoStore {
  const raw = localStorage.getItem(STORE_KEY)

  if (!raw) {
    return {
      projects: [],
      batches: [],
      screens: [],
      clusters: [],
      shortlistItems: [],
    }
  }

  try {
    const parsed = JSON.parse(raw) as DemoStore
    return {
      projects: parsed.projects ?? [],
      batches: parsed.batches ?? [],
      screens: parsed.screens ?? [],
      clusters: parsed.clusters ?? [],
      shortlistItems: parsed.shortlistItems ?? [],
    }
  } catch {
    return {
      projects: [],
      batches: [],
      screens: [],
      clusters: [],
      shortlistItems: [],
    }
  }
}

function writeStore(store: DemoStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

function recomputeProject(project: Project, store: DemoStore) {
  const screens = store.screens.filter((screen) => screen.projectId === project.id)
  const clusters = store.clusters.filter((cluster) => cluster.projectId === project.id)
  const shortlistItems = store.shortlistItems.filter((item) => item.projectId === project.id)

  return {
    ...project,
    coverImageUrl: screens[0]?.thumbnailUrl ?? project.coverImageUrl,
    updatedAt: now(),
    screenCount: screens.length,
    clusterCount: clusters.length,
    shortlistCount: shortlistItems.length,
  } satisfies Project
}

function reorderGroup(items: ShortlistItem[]) {
  return items
    .sort((left, right) => left.position - right.position)
    .map((item, index) => ({ ...item, position: index }))
}

export function ensureDemoSeed(user: AuthUser) {
  const store = readStore()
  const existing = store.projects.filter((project) => project.userId === user.id)

  if (existing.length > 0) {
    return
  }

  const seed = createSeedProject(user)
  writeStore({
    ...store,
    projects: [...store.projects, seed.project],
    batches: [...store.batches, seed.batch],
    screens: [...store.screens, ...seed.screens],
    clusters: [...store.clusters, ...seed.clusters],
    shortlistItems: [...store.shortlistItems, ...seed.shortlistItems],
  })
}

export async function listProjects(userId: string) {
  const store = readStore()
  return store.projects
    .filter((project) => project.userId === userId)
    .map((project) => recomputeProject(project, store))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getProject(projectId: string) {
  const store = readStore()
  const project = store.projects.find((entry) => entry.id === projectId)
  return project ? recomputeProject(project, store) : null
}

export async function createProject(userId: string, input: CreateProjectInput) {
  const store = readStore()
  const project: Project = {
    id: createId('project'),
    userId,
    name: input.name,
    platform: input.platform,
    category: input.category,
    description: input.description,
    coverImageUrl: null,
    createdAt: now(),
    updatedAt: now(),
    screenCount: 0,
    clusterCount: 0,
    shortlistCount: 0,
  }

  store.projects.push(project)
  writeStore(store)
  return project
}

export async function listScreens(projectId: string) {
  const store = readStore()
  return store.screens
    .filter((screen) => screen.projectId === projectId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export async function listClusters(projectId: string) {
  const store = readStore()
  return store.clusters
    .filter((cluster) => cluster.projectId === projectId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getCluster(projectId: string, clusterId: string) {
  const store = readStore()
  return (
    store.clusters.find(
      (cluster) => cluster.projectId === projectId && cluster.id === clusterId,
    ) ?? null
  )
}

export async function uploadScreens(
  projectId: string,
  files: File[],
  onProgress?: (value: number) => void,
) {
  const store = readStore()
  const batch: Batch = {
    id: createId('batch'),
    projectId,
    status: 'uploading',
    createdAt: now(),
  }
  store.batches.push(batch)
  writeStore(store)

  const createdScreens: Screen[] = []

  for (const [index, file] of files.entries()) {
    const dataUrl = await readFileAsDataUrl(file)
    createdScreens.push({
      id: createId('screen'),
      projectId,
      batchId: batch.id,
      name: file.name,
      imageUrl: dataUrl,
      thumbnailUrl: dataUrl,
      status: 'ungrouped',
      source: 'upload',
      clusterId: null,
      createdAt: now(),
      width: null,
      height: null,
    })

    onProgress?.((index + 1) / files.length)
  }

  const projectClusters = store.clusters.filter((cluster) => cluster.projectId === projectId)
  const { clusters, screenUpdates } = generateClusterSuggestions(
    projectId,
    createdScreens,
    projectClusters.length,
  )

  const hydratedScreens = createdScreens.map((screen) => ({
    ...screen,
    ...screenUpdates.get(screen.id),
  })) satisfies Screen[]

  const nextStore: DemoStore = {
    ...store,
    batches: store.batches.map((entry) =>
      entry.id === batch.id ? { ...entry, status: 'ready' } : entry,
    ),
    screens: [...store.screens, ...hydratedScreens],
    clusters: [...store.clusters, ...clusters],
    shortlistItems: store.shortlistItems,
    projects: store.projects.map((project) =>
      project.id === projectId
        ? recomputeProject(
            {
              ...project,
              coverImageUrl: hydratedScreens[0]?.thumbnailUrl ?? project.coverImageUrl,
            },
            {
              ...store,
              screens: [...store.screens, ...hydratedScreens],
              clusters: [...store.clusters, ...clusters],
            },
          )
        : project,
    ),
  }

  writeStore(nextStore)

  return {
    batch: { ...batch, status: 'ready' },
    screens: hydratedScreens,
    clusters,
  } satisfies UploadResult
}

export async function updateCluster(clusterId: string, updates: Partial<Cluster>) {
  const store = readStore()
  let nextCluster: Cluster | null = null

  const clusters = store.clusters.map((cluster) => {
    if (cluster.id !== clusterId) {
      return cluster
    }

    nextCluster = {
      ...cluster,
      ...updates,
      updatedAt: now(),
    }

    return nextCluster
  })

  writeStore({ ...store, clusters })

  if (!nextCluster) {
    throw new Error('Cluster not found')
  }

  return nextCluster
}

export async function moveScreen(screenId: string, targetClusterId: string | null) {
  const store = readStore()

  const screens = store.screens.map((screen) => {
    if (screen.id !== screenId) {
      return screen
    }

    return {
      ...screen,
      clusterId: targetClusterId,
      status: (targetClusterId ? 'grouped' : 'ungrouped') as ScreenStatus,
    }
  })

  const clusters = store.clusters.map((cluster) =>
    cluster.id === targetClusterId || cluster.id === store.screens.find((screen) => screen.id === screenId)?.clusterId
      ? { ...cluster, status: 'edited' as ClusterStatus, updatedAt: now() }
      : cluster,
  )

  writeStore({ ...store, screens, clusters })
}

export async function mergeClusters(projectId: string, sourceClusterId: string, targetClusterId: string) {
  const store = readStore()
  const screens = store.screens.map((screen) =>
    screen.projectId === projectId && screen.clusterId === sourceClusterId
      ? { ...screen, clusterId: targetClusterId, status: 'grouped' as ScreenStatus }
      : screen,
  )

  const clusters = store.clusters
    .filter((cluster) => cluster.id !== sourceClusterId)
    .map((cluster) =>
      cluster.id === targetClusterId
        ? { ...cluster, status: 'edited' as ClusterStatus, updatedAt: now() }
        : cluster,
    )

  writeStore({ ...store, screens, clusters })
}

export async function splitCluster(projectId: string, clusterId: string) {
  const store = readStore()
  const cluster = store.clusters.find((entry) => entry.id === clusterId && entry.projectId === projectId)

  if (!cluster) {
    throw new Error('Cluster not found')
  }

  const clusterScreens = store.screens.filter((screen) => screen.projectId === projectId && screen.clusterId === clusterId)
  const replacementClusters = clusterScreens.map((screen) => ({
    id: createId('cluster'),
    projectId,
    title: screen.name.replace(/\.[a-z0-9]+$/i, ''),
    status: 'review_needed',
    confidence: 0.55,
    tags: ['needs review'],
    note: 'Split from a larger cluster. Review manually and regroup if needed.',
    createdAt: now(),
    updatedAt: now(),
  } satisfies Cluster))

  const screens = store.screens.map((screen) => {
    const replacement = replacementClusters[clusterScreens.findIndex((entry) => entry.id === screen.id)]

    if (!replacement) {
      return screen
    }

    return {
      ...screen,
      clusterId: replacement.id,
      status: 'ungrouped' as ScreenStatus,
    }
  })

  const clusters = store.clusters
    .filter((entry) => entry.id !== clusterId)
    .concat(replacementClusters)

  writeStore({ ...store, screens, clusters })
}

export async function addToShortlist(projectId: string, screenIds: string[], group: ShortlistGroup = 'Standout flows') {
  const store = readStore()
  const existingIds = new Set(
    store.shortlistItems.filter((item) => item.projectId === projectId).map((item) => item.screenId),
  )
  const currentGroupItems = store.shortlistItems.filter(
    (item) => item.projectId === projectId && item.group === group,
  )
  let position = currentGroupItems.length

  const nextItems = [...store.shortlistItems]

  for (const screenId of screenIds) {
    if (existingIds.has(screenId)) {
      continue
    }

    nextItems.push({
      id: createId('shortlist'),
      projectId,
      screenId,
      label: 'Saved from compare',
      group,
      position,
      createdAt: now(),
    })
    position += 1
  }

  writeStore({ ...store, shortlistItems: nextItems })
}

export async function listShortlist(projectId: string) {
  const store = readStore()
  const screensById = new Map(store.screens.map((screen) => [screen.id, screen]))

  return store.shortlistItems
    .filter((item) => item.projectId === projectId)
    .sort((left, right) => {
      if (left.group === right.group) {
        return left.position - right.position
      }
      return left.group.localeCompare(right.group)
    })
    .flatMap((item) => {
      const screen = screensById.get(item.screenId)
      return screen ? [{ ...item, screen } satisfies ShortlistEntry] : []
    })
}

export async function updateShortlistItem(
  projectId: string,
  itemId: string,
  updates: Partial<Pick<ShortlistItem, 'group' | 'position' | 'label'>>,
) {
  const store = readStore()
  const shortlistItems = store.shortlistItems.map((item) =>
    item.id === itemId && item.projectId === projectId ? { ...item, ...updates } : item,
  )
  const normalized: ShortlistItem[] = []

  const groups = new Map<string, ShortlistItem[]>()
  shortlistItems
    .filter((item) => item.projectId === projectId)
    .forEach((item) => {
      const next = groups.get(item.group) ?? []
      next.push(item)
      groups.set(item.group, next)
    })

  groups.forEach((items) => {
    normalized.push(...reorderGroup(items))
  })

  const untouched = shortlistItems.filter((item) => item.projectId !== projectId)
  writeStore({ ...store, shortlistItems: [...untouched, ...normalized] })
}

export async function removeShortlistItem(projectId: string, itemId: string) {
  const store = readStore()
  const shortlistItems = store.shortlistItems.filter(
    (item) => !(item.projectId === projectId && item.id === itemId),
  )
  writeStore({ ...store, shortlistItems })
}
