import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, LogOut, Sparkles } from 'lucide-react'

import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils/cn'

const navigation = [
  { to: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
  { to: '/projects/new', label: 'Create project', icon: Sparkles },
]

export function AppShell() {
  const { user, demoMode, signOut } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="surface-panel sticky top-4 z-30 mb-6 flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-white shadow-glow"
            >
              <Sparkles className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
                Pattern Miner
              </p>
              <p className="text-sm text-muted">
                Structured pattern research for designers
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                      isActive
                        ? 'bg-accent text-white shadow-glow'
                        : 'bg-white/70 text-muted hover:bg-white hover:text-text',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-white/70 px-3 py-2 text-right sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                {demoMode ? 'Demo mode' : 'Supabase live'}
              </p>
              <p className="text-sm font-semibold text-text">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void signOut()
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-text transition hover:border-accent/40 hover:text-accent"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </button>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
