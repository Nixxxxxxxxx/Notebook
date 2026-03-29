import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedLayout } from '@/app/layouts/protected-layout'
import { AuthCallbackPage } from '@/pages/auth/auth-callback-page'
import { EntryPage } from '@/pages/auth/entry-page'
import { ClusterDetailPage } from '@/pages/cluster-detail/cluster-detail-page'
import { ClustersPage } from '@/pages/clusters/clusters-page'
import { ComparePage } from '@/pages/compare/compare-page'
import { CreateProjectPage } from '@/pages/create-project/create-project-page'
import { DashboardPage } from '@/pages/dashboard/dashboard-page'
import { LibraryPage } from '@/pages/library/library-page'
import { ShortlistPage } from '@/pages/shortlist/shortlist-page'
import { UploadPage } from '@/pages/upload/upload-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <EntryPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/projects/new', element: <CreateProjectPage /> },
      { path: '/projects/:projectId/upload', element: <UploadPage /> },
      { path: '/projects/:projectId/library', element: <LibraryPage /> },
      { path: '/projects/:projectId/clusters', element: <ClustersPage /> },
      { path: '/projects/:projectId/clusters/:clusterId', element: <ClusterDetailPage /> },
      { path: '/projects/:projectId/compare', element: <ComparePage /> },
      { path: '/projects/:projectId/shortlist', element: <ShortlistPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
