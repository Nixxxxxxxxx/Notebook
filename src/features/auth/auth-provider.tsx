import { type PropsWithChildren, useEffect, useState } from 'react'

import { AuthContext } from '@/features/auth/auth-context'
import { appClient } from '@/lib/data/app-client'
import {
  clearDemoPendingEmail,
  clearDemoUser,
  completeDemoSignIn,
  getDemoPendingEmail,
  getDemoUser,
  setDemoPendingEmail,
} from '@/lib/data/demo-session'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { AuthUser } from '@/types/domain'

function mapSupabaseUser(email: string, id: string) {
  return {
    id,
    email,
    name:
      email
        .split('@')[0]
        .split(/[._-]/g)
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ') || 'Pattern Miner user',
  } satisfies AuthUser
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    !isSupabaseConfigured ? getDemoUser() : null,
  )
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => getDemoPendingEmail())

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const nextUser = data.session?.user.email
          ? mapSupabaseUser(data.session.user.email, data.session.user.id)
          : null
        setUser(nextUser)
      })
      .finally(() => {
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user.email
        ? mapSupabaseUser(session.user.email, session.user.id)
        : null
      setUser(nextUser)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const requestMagicLink = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      setDemoPendingEmail(email)
      setPendingEmail(email)
      return 'demo'
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: appClient.getAuthRedirectUrl(),
      },
    })

    if (error) {
      throw error
    }

    return 'supabase'
  }

  const finishDemoSignIn = async (email?: string) => {
    const nextEmail = email ?? pendingEmail

    if (!nextEmail) {
      throw new Error('Missing demo email')
    }

    const nextUser = completeDemoSignIn(nextEmail)
    await appClient.ensureSeedData(nextUser)
    setUser(nextUser)
    setPendingEmail(null)
    return nextUser
  }

  const signOut = async () => {
    if (!isSupabaseConfigured || !supabase) {
      clearDemoUser()
      setUser(null)
      setPendingEmail(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    clearDemoPendingEmail()
    setPendingEmail(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoMode: !isSupabaseConfigured,
        requestMagicLink,
        finishDemoSignIn,
        signOut,
        pendingEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
