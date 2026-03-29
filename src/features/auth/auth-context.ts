import { createContext } from 'react'

import type { AuthUser } from '@/types/domain'

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  demoMode: boolean
  requestMagicLink: (email: string) => Promise<'demo' | 'supabase'>
  finishDemoSignIn: (email?: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  pendingEmail: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
