import Link from 'next/link'
import { redirect } from 'next/navigation'

import { loadGeneratedContentList } from '@/lib/generated-content'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getContentTitle(content: string) {
  const firstLine =
    content
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? 'Recurso sin titulo'

  return firstLine.replace(/^titulo\s*[:.-]?\s*/i, '') || 'Recurso sin titulo'
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { items: recentItems, error } = await loadGeneratedContentList({
    supabase,
    userId: user.id,
    limit: 6,
    logContext: 'DashboardPage',
  })
  const favoriteItems = recentItems.filter((item) => item.is_favorite).slice(0, 3)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Panel docente</p>
            <h1 className="text-3xl font-semibold tracking-tight text-text">
              Bienvenido de vuelta
            </h1>
            <p className="text-sm leading-6 text-text-muted">
              Gestiona tus recursos y retoma rapido el trabajo reciente.
              {user.email ? ` Sesion iniciada como ${user.email}.` : ''}
            </p>
          </div>

          <Link
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            href="/generator"
          >
            Crear recurso
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text">Acciones rapidas</h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            className="rounded-lg border border-border bg-primary-bg px-4 py-4 text-sm font-medium text-text hover:bg-primary-soft"
            href="/generator?resourceType=evaluacion"
          >
            Crear evaluacion
          </Link>
          <Link
            className="rounded-lg border border-border bg-primary-bg px-4 py-4 text-sm font-medium text-text hover:bg-primary-soft"
            href="/generator?resourceType=actividad"
          >
            Crear actividad
          </Link>
          <Link
            className="rounded-lg border border-border bg-primary-bg px-4 py-4 text-sm font-medium text-text hover:bg-primary-soft"
            href="/generator?resourceType=proyecto"
          >
            Crear proyecto
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-text">
            Contenido reciente
          </h2>
          <Link
            className="text-sm font-medium text-primary hover:text-primary-hover"
            href="/history"
          >
            Ir al historial
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-border bg-primary-bg p-4">
            <p className="text-sm text-text-muted">{error}</p>
          </div>
        ) : null}

        {recentItems.length ? (
          <ul className="mt-6 divide-y divide-border">
            {recentItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-text">
                    {item.title || getContentTitle(item.content)}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {item.resourceTypeName ?? 'Recurso'}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">
                    {new Date(item.created_at).toLocaleString('es-CL')}
                  </p>
                </div>

                <Link
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                  href={`/history/${item.id}`}
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-lg border border-border bg-primary-bg p-4">
            <p className="text-sm text-text-muted">
              Aun no tienes recursos recientes. Crea tu primer recurso desde el
              generador.
            </p>
          </div>
        )}
      </section>

      {favoriteItems.length ? (
        <section className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-text">Favoritos</h2>
          </div>

          <ul className="mt-6 divide-y divide-border">
            {favoriteItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" className="text-sm text-primary">
                      ★
                    </span>
                    <p className="truncate text-base font-medium text-text">
                      {item.title || getContentTitle(item.content)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {item.resourceTypeName ?? 'Recurso'}
                  </p>
                </div>

                <Link
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                  href={`/history/${item.id}`}
                >
                  Ver
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}
