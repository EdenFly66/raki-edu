import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { CurationControls } from '@/app/history/[id]/CurationControls'
import { ExportPdfButton } from '@/app/history/[id]/ExportPdfButton'
import { TitleEditor } from '@/app/history/[id]/TitleEditor'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type HistoryDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

type HistoryDetail = {
  id: string
  created_at: string
  title: string | null
  is_favorite: boolean | null
  is_helpful: boolean | null
  question_count: number | null
  content: string
  learning_objective_id: string
  resource_types:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
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

type HistoryObjectiveRelation = {
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

function getContentTitle(content: string) {
  const firstLine =
    content
      .split('\n')
      .map((line) => line.trim())
      .find(Boolean) ?? 'Recurso sin titulo'

  return firstLine.replace(/^titulo\s*[:.-]?\s*/i, '') || 'Recurso sin titulo'
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
      'id, created_at, title, is_favorite, is_helpful, question_count, content, learning_objective_id, resource_types(name), learning_objectives(oa_code, title)'
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

  const { data: objectiveRelations, error: objectivesError } = await supabase
    .from('generated_content_learning_objectives')
    .select('learning_objectives(oa_code, title)')
    .eq('generated_content_id', item.id)
    .order('sort_order')

  if (objectivesError) {
    console.error(
      'Failed to load history detail objectives:',
      objectivesError.message
    )
  }

  const learningObjective = Array.isArray(item.learning_objectives)
    ? item.learning_objectives[0]
    : item.learning_objectives
  const resourceType = Array.isArray(item.resource_types)
    ? item.resource_types[0]
    : item.resource_types
  const objectives =
    (objectiveRelations as HistoryObjectiveRelation[] | null)
      ?.map((relation) =>
        Array.isArray(relation.learning_objectives)
          ? relation.learning_objectives[0]
          : relation.learning_objectives
      )
      .filter(
        (
          objective
        ): objective is {
          oa_code: string | null
          title: string
        } => Boolean(objective?.title)
      )
      .map((objective) =>
        objective.oa_code
          ? `${objective.oa_code} - ${objective.title}`
          : objective.title
      ) ?? []
  const fallbackObjective = learningObjective
    ? [
        learningObjective.oa_code
          ? `${learningObjective.oa_code} - ${learningObjective.title}`
          : learningObjective.title,
      ]
    : [item.learning_objective_id]
  const printableObjectives = objectives.length ? objectives : fallbackObjective
  const title = item.title || getContentTitle(item.content)
  const formattedCreatedAt = new Date(item.created_at).toLocaleString('es-CL')

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Contenido generado
        </h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-primary-soft"
          href="/history"
        >
          Volver al historial
        </Link>
        <ExportPdfButton
          content={item.content}
          createdAt={formattedCreatedAt}
          objectives={printableObjectives}
          resourceType={resourceType?.name ?? 'Recurso'}
          title={title}
        />
      </div>

      <section className="mt-8 rounded-lg border border-border bg-surface p-6 text-text shadow-sm">
        <TitleEditor id={item.id} initialTitle={title} />
        <div className="mt-4">
          <CurationControls
            id={item.id}
            isFavorite={Boolean(item.is_favorite)}
            isHelpful={item.is_helpful}
          />
        </div>

        <div className="mt-6 space-y-2 text-sm text-text-muted">
          <p>
            <span className="font-medium text-text">Titulo:</span> {title}
          </p>
          <p>
            <span className="font-medium text-text">Fecha:</span>{' '}
            {formattedCreatedAt}
          </p>
          <p>
            <span className="font-medium text-text">Tipo de recurso:</span>{' '}
            {resourceType?.name ?? 'Recurso'}
          </p>
          {item.question_count !== null ? (
            <p>
              <span className="font-medium text-text">
                Cantidad de preguntas:
              </span>{' '}
              {item.question_count}
            </p>
          ) : null}
          <p>
            <span className="font-medium text-text">
              Objetivos de Aprendizaje:
            </span>{' '}
            {printableObjectives.join(', ')}
          </p>
        </div>

        <pre className="mt-6 whitespace-pre-wrap text-sm leading-7 text-text">
          {item.content}
        </pre>
      </section>
    </main>
  )
}
