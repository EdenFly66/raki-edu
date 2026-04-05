import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'

type HistoryItem = {
  id: string
  created_at: string
  question_count: number
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

export default async function HistoryPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data } = await supabase
    .from('generated_content')
    .select(
      'id, created_at, question_count, learning_objective_id, learning_objectives(oa_code, title)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const items = (data as HistoryItem[] | null) ?? []

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Historial</h1>
        <Link
          className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium"
          href="/generator"
        >
          Nuevo contenido
        </Link>
      </div>

      {items.length ? (
        <div className="mt-8 overflow-hidden rounded-lg border border-black/10 bg-white">
          <ul className="divide-y divide-black/10">
            {items.map((item) => {
              const learningObjective = Array.isArray(item.learning_objectives)
                ? item.learning_objectives[0]
                : item.learning_objectives

              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-black/60">
                      {new Date(item.created_at).toLocaleString('es-CL')}
                    </p>
                    <p className="mt-1 text-sm">
                      {learningObjective
                        ? `${learningObjective.oa_code ?? 'OA'} - ${learningObjective.title}`
                        : item.learning_objective_id}
                    </p>
                    <p className="mt-1 text-sm text-black/70">
                      {item.question_count} preguntas
                    </p>
                  </div>

                  <Link
                    className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium"
                    href={`/history/${item.id}`}
                  >
                    Ver
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-black/10 bg-white p-6">
          <p className="text-sm text-black/70">
            Aun no tienes contenido generado.
          </p>
        </div>
      )}
    </main>
  )
}
