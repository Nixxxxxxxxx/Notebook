import type { AuthUser } from '@/types/domain'
import { slugify } from '@/lib/utils/format'

const DEMO_USER_KEY = 'pattern-miner-demo-user'
const DEMO_PENDING_EMAIL_KEY = 'pattern-miner-demo-pending-email'

export function getDemoUser() {
  const raw = localStorage.getItem(DEMO_USER_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setDemoPendingEmail(email: string) {
  localStorage.setItem(DEMO_PENDING_EMAIL_KEY, email)
}

export function getDemoPendingEmail() {
  return localStorage.getItem(DEMO_PENDING_EMAIL_KEY)
}

export function clearDemoPendingEmail() {
  localStorage.removeItem(DEMO_PENDING_EMAIL_KEY)
}

export function completeDemoSignIn(email: string) {
  const user = {
    id: `demo-${slugify(email) || 'designer'}`,
    email,
    name:
      email
        .split('@')[0]
        .split(/[._-]/g)
        .filter(Boolean)
        .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
        .join(' ') || 'Design Explorer',
  } satisfies AuthUser

  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
  clearDemoPendingEmail()
  return user
}

export function clearDemoUser() {
  localStorage.removeItem(DEMO_USER_KEY)
  clearDemoPendingEmail()
}
