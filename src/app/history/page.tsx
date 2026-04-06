import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ExportPdfButton } from '@/app/history/[id]/ExportPdfButton'
import { loadGeneratedContentList } from '@/lib/generated-content'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function getContentPreview(content: string) {
  const normalizedPreview = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim()

  if (!normalizedPreview) {
    return 'Sin vista previa disponible.'
  }

  return normalizedPreview.length > 520
    ? `${normalizedPreview.slice(0, 517)}...`
    : normalizedPreview
}

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { items, error } = await loadGeneratedContentList({
    supabase,
    userId: user.id,
    logContext: 'HistoryPage',
  })

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Historial
        </h1>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-border bg-primary-bg p-4">
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      ) : null}

      {items.length ? (
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
          <ul className="divide-y divide-border">
            {items.map((item) => {
              const primaryObjective = item.objectives[0] ?? item.learning_objective_id

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-text-muted">
                      {new Date(item.created_at).toLocaleString('es-CL')}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {item.is_favorite ? (
                        <span
                          aria-label="Favorito"
                          className="text-sm text-primary"
                        >
                          ★
                        </span>
                      ) : null}
                      <p className="text-sm font-medium text-text">
                        {item.title || 'Recurso sin titulo'}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      {item.resourceTypeName ?? 'Recurso'}
                    </p>
                    <p className="mt-1 text-sm text-text">{primaryObjective}</p>
                    <p
                      className="mt-2 whitespace-pre-line text-sm leading-6 text-text-muted"
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 6,
                        overflow: 'hidden',
                      }}
                    >
                      {getContentPreview(item.content)}
                    </p>
                    {item.question_count !== null ? (
                      <p className="mt-1 text-sm text-text-muted">
                        {item.question_count} preguntas
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <Link
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
                      href={`/history/${item.id}`}
                    >
                      Ver
                    </Link>
                    <ExportPdfButton
                      content={item.content}
                      createdAt={new Date(item.created_at).toLocaleString('es-CL')}
                      objectives={item.objectives}
                      resourceType={item.resourceTypeName ?? 'Recurso'}
                      title={item.title || 'Recurso sin titulo'}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm text-text-muted">
            Aun no tienes contenido generado.
          </p>
        </div>
      )}
    </main>
  )
}
