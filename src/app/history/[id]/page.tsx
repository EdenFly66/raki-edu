import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'

type HistoryDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type HistoryDetail = {
  id: string
  created_at: string
  question_count: number | null
  content: string
  learning_objective_id: string
  learning_objectives:
    | {
        oa_code: string | null
        title: string
      }
    | {
        oa_code: string | null
        title: string
      }[]
    | null
}

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('generated_content')
    .select(
      'id, created_at, question_count, content, learning_objective_id, learning_objectives(oa_code, title)'
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Failed to load history detail:', error.message)
  }

  const item = data as HistoryDetail | null

  if (!item) {
    notFound()
  }

  const learningObjective = Array.isArray(item.learning_objectives)
    ? item.learning_objectives[0]
    : item.learning_objectives

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Contenido generado
        </h1>
      </div>

      <div className="mt-6">
        <Link
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
          href="/history"
        >
          Volver al historial
        </Link>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-surface p-6 text-text shadow-sm">
        <div className="space-y-2 text-sm text-text-muted">
          <p>
            <span className="font-medium text-text">Fecha:</span>{' '}
            {new Date(item.created_at).toLocaleString('es-CL')}
          </p>
          {item.question_count !== null ? (
            <p>
              <span className="font-medium text-text">Cantidad de preguntas:</span>{' '}
              {item.question_count}
            </p>
          ) : null}
          <p>
            <span className="font-medium text-text">Objetivo de Aprendizaje:</span>{' '}
            {learningObjective
              ? `${learningObjective.oa_code ?? 'OA'} - ${learningObjective.title}`
              : item.learning_objective_id}
          </p>
        </div>

        <pre className="mt-6 whitespace-pre-wrap text-sm leading-7 text-text">
          {item.content}
        </pre>
      </section>
    </main>
  )
}
