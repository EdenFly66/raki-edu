'use client'

import { useActionState, useEffect, useState } from 'react'

import {
  generateEducationalTestAction,
  type GeneratorState,
} from '@/app/generator/actions'
import type { AcademicLevelOption } from '@/app/generator/page'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

type GeneratorFormProps = {
  levels: AcademicLevelOption[]
}

type SubjectOption = {
  id: string
  name: string
}

type SubjectJoin = {
  name: string
} | null

type LevelSubjectRow = {
  id: string
  subjects: SubjectJoin | SubjectJoin[]
}

type LearningObjectiveOption = {
  id: string
  label: string
}

type LearningObjectiveRow = {
  id: string
  oa_code: string | null
  title: string
}

const initialState: GeneratorState = {
  content: '',
  error: '',
}

export function GeneratorForm({ levels }: GeneratorFormProps) {
  const [state, formAction, pending] = useActionState(
    generateEducationalTestAction,
    initialState
  )
  const [levelId, setLevelId] = useState('')
  const [levelSubjectId, setLevelSubjectId] = useState('')
  const [learningObjectiveId, setLearningObjectiveId] = useState('')
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [learningObjectives, setLearningObjectives] = useState<
    LearningObjectiveOption[]
  >([])

  useEffect(() => {
    if (!levelId) {
      setSubjects([])
      setLevelSubjectId('')
      setLearningObjectives([])
      setLearningObjectiveId('')
      return
    }

    const supabase = createBrowserSupabaseClient()

    async function loadSubjects() {
      const { data } = await supabase
        .from('level_subjects')
        .select('id, sort_order, subjects(name)')
        .eq('level_id', levelId)
        .eq('is_active', true)
        .order('sort_order')

      const nextSubjects =
        (data as LevelSubjectRow[] | null)?.map((item) => ({
          id: item.id,
          name: Array.isArray(item.subjects)
            ? item.subjects[0]?.name ?? ''
            : item.subjects?.name ?? '',
        }))?.filter((item) => item.name) ?? []

      setSubjects(nextSubjects)
      setLevelSubjectId('')
      setLearningObjectives([])
      setLearningObjectiveId('')
    }

    loadSubjects()
  }, [levelId])

  useEffect(() => {
    if (!levelSubjectId) {
      setLearningObjectives([])
      setLearningObjectiveId('')
      return
    }

    const supabase = createBrowserSupabaseClient()

    async function loadLearningObjectives() {
      const { data } = await supabase
        .from('learning_objectives')
        .select('id, oa_code, title, sort_order')
        .eq('level_subject_id', levelSubjectId)
        .eq('is_active', true)
        .order('sort_order')

      const nextObjectives =
        (data as LearningObjectiveRow[] | null)?.map((item) => ({
          id: item.id,
          label: item.oa_code
            ? `${item.oa_code} - ${item.title}`
            : item.title,
        })) ?? []

      setLearningObjectives(nextObjectives)
      setLearningObjectiveId('')
    }

    loadLearningObjectives()
  }, [levelSubjectId])

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <h1 className="text-2xl font-semibold">Generador de Evaluaciones</h1>

      <form action={formAction} className="mt-8 grid gap-4">
        <label className="grid gap-2 text-sm">
          Nivel
          <select
            className="rounded-md border border-black/20 bg-white px-3 py-2 text-black"
            name="levelId"
            onChange={(event) => setLevelId(event.target.value)}
            required
            value={levelId}
          >
            <option value="">Selecciona un nivel</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          Asignatura
          <select
            className="rounded-md border border-black/20 bg-white px-3 py-2 text-black disabled:bg-black/5"
            disabled={!subjects.length}
            name="levelSubjectId"
            onChange={(event) => setLevelSubjectId(event.target.value)}
            required
            value={levelSubjectId}
          >
            <option value="">Selecciona una asignatura</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          Objetivo de Aprendizaje
          <select
            className="rounded-md border border-black/20 bg-white px-3 py-2 text-black disabled:bg-black/5"
            disabled={!learningObjectives.length}
            name="learningObjectiveId"
            onChange={(event) => setLearningObjectiveId(event.target.value)}
            required
            value={learningObjectiveId}
          >
            <option value="">Selecciona un objetivo</option>
            {learningObjectives.map((objective) => (
              <option key={objective.id} value={objective.id}>
                {objective.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          Cantidad de Preguntas
          <input
            className="rounded-md border border-black/20 bg-white px-3 py-2 text-black"
            max={20}
            min={1}
            name="questionCount"
            type="number"
            required
          />
        </label>

        {state.error ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}

        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? 'Generando...' : 'Generar evaluacion'}
        </button>
      </form>

      {state.content ? (
        <section className="mt-10 rounded-lg border border-black/10 bg-white p-6 text-black">
          <h2 className="text-lg font-semibold">Resultado generado</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-6">
            {state.content}
          </pre>
        </section>
      ) : null}
    </main>
  )
}
