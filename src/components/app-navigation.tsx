import Link from 'next/link'

import { logoutAction } from '@/app/dashboard/actions'

export function AppNavigation() {
  return (
    <nav className="rounded-lg border border-border bg-surface px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="rounded-md px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
          href="/dashboard"
        >
          Panel
        </Link>
        <Link
          className="rounded-md px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
          href="/generator"
        >
          Generador
        </Link>
        <Link
          className="rounded-md px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
          href="/history"
        >
          Historial
        </Link>
        <form action={logoutAction}>
          <button
            className="rounded-md px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
            type="submit"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </nav>
  )
}
