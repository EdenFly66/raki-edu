'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'

import {
  generateEducationalTestAction,
  type GeneratorState,
} from '@/app/generator/actions'
import type {
  AcademicLevelOption,
  GeneratorCatalogOption,
} from '@/app/generator/page'
import { createBrowserSupabaseClient } from '@/lib/supabase/browser'

type GeneratorFormProps = {
  levels: AcademicLevelOption[]
  resourceTypes: GeneratorCatalogOption[]
  difficultyLevels: GeneratorCatalogOption[]
  modalities: GeneratorCatalogOption[]
  initialResourceTypeId: string
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
  level_subject_id: string
  oa_code: string | null
  title: string
}

const initialState: GeneratorState = {
  content: '',
  error: '',
}

const loadingMessages = [
  'Analizando el objetivo de aprendizaje',
  'Disenando las preguntas',
  'Ajustando la dificultad',
  'Preparando el resultado final',
]

const resourceTypesWithQuestions = new Set(['evaluacion'])

export function GeneratorForm({
  levels,
  resourceTypes,
  difficultyLevels,
  modalities,
  initialResourceTypeId,
}: GeneratorFormProps) {
  const [state, formAction, pending] = useActionState(
    generateEducationalTestAction,
    initialState
  )
  const [resourceTypeId, setResourceTypeId] = useState(initialResourceTypeId)
  const [difficultyId, setDifficultyId] = useState('')
  const [modalityId, setModalityId] = useState('')
  const [levelId, setLevelId] = useState('')
  const [levelSubjectIds, setLevelSubjectIds] = useState<string[]>([])
  const [learningObjectiveIds, setLearningObjectiveIds] = useState<string[]>([])
  const [estimatedClassCount, setEstimatedClassCount] = useState('1')
  const [questionCount, setQuestionCount] = useState('5')
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [learningObjectives, setLearningObjectives] = useState<
    LearningObjectiveOption[]
  >([])
  const [loadingProgress, setLoadingProgress] = useState(0)

  const subjectSelectDisabled = !levelId || !subjects.length
  const learningObjectivesDisabled =
    !levelSubjectIds.length || !learningObjectives.length

  const selectedResourceType = useMemo(
    () =>
      resourceTypes.find((resourceType) => resourceType.id === resourceTypeId) ??
      null,
    [resourceTypeId, resourceTypes]
  )
  const isProjectResource = selectedResourceType?.code === 'proyecto'
  const requiresQuestionCount = selectedResourceType
    ? resourceTypesWithQuestions.has(selectedResourceType.code)
    : false

  useEffect(() => {
    if (!pending) {
      setLoadingProgress(0)
      return
    }

    const interval = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= 92) {
          return current
        }

        if (current < 24) {
          return current + 4
        }

        if (current < 52) {
          return current + 3
        }

        if (current < 76) {
          return current + 2
        }

        return current + 1
      })
    }, 500)

    return () => window.clearInterval(interval)
  }, [pending])

  useEffect(() => {
    if (!isProjectResource) {
      setEstimatedClassCount('1')
    }
  }, [isProjectResource])

  useEffect(() => {
    if (!requiresQuestionCount) {
      setQuestionCount('5')
    }
  }, [requiresQuestionCount])

  useEffect(() => {
    if (!levelId) {
      setSubjects([])
      setLevelSubjectIds([])
      setLearningObjectives([])
      setLearningObjectiveIds([])
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
        (data as LevelSubjectRow[] | null)
          ?.map((item) => ({
            id: item.id,
            name: Array.isArray(item.subjects)
              ? item.subjects[0]?.name ?? ''
              : item.subjects?.name ?? '',
          }))
          .filter((item) => item.name) ?? []

      setSubjects(nextSubjects)
      setLevelSubjectIds([])
      setLearningObjectives([])
      setLearningObjectiveIds([])
    }

    loadSubjects()
  }, [levelId])

  useEffect(() => {
    if (!levelSubjectIds.length) {
      setLearningObjectives([])
      setLearningObjectiveIds([])
      return
    }

    const supabase = createBrowserSupabaseClient()

    async function loadLearningObjectives() {
      const selectedSubjects = new Map(
        subjects
          .filter((subject) => levelSubjectIds.includes(subject.id))
          .map((subject) => [subject.id, subject.name])
      )

      const { data } = await supabase
        .from('learning_objectives')
        .select('id, level_subject_id, oa_code, title, sort_order')
        .in('level_subject_id', levelSubjectIds)
        .eq('is_active', true)
        .order('sort_order')

      const nextObjectives =
        (data as LearningObjectiveRow[] | null)?.map((item) => ({
          id: item.id,
          label: [
            selectedSubjects.get(item.level_subject_id),
            item.oa_code ? `${item.oa_code} - ${item.title}` : item.title,
          ]
            .filter(Boolean)
            .join(': '),
        })) ?? []

      setLearningObjectives(nextObjectives)
      setLearningObjectiveIds((current) =>
        current.filter((id) =>
          nextObjectives.some((objective) => objective.id === id)
        )
      )
    }

    loadLearningObjectives()
  }, [levelSubjectIds, subjects])

  const loadingStep =
    loadingProgress < 25 ? 0 : loadingProgress < 50 ? 1 : loadingProgress < 75 ? 2 : 3

  return (
    <>
      <form
        action={formAction}
        className="mt-8 rounded-lg border border-border bg-surface p-6 shadow-sm"
      >
        <div className="grid gap-6">
          <label className="grid gap-2 text-sm text-text-muted">
            Nivel
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
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

          <fieldset className="grid gap-2">
            <legend className="text-sm text-text-muted">Asignaturas</legend>
            <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
              {subjectSelectDisabled ? (
                <p className="text-sm text-disabled-text">
                  Selecciona un nivel para ver las asignaturas.
                </p>
              ) : (
                <div className="grid gap-3">
                  {subjects.map((subject) => (
                    <label
                      key={subject.id}
                      className="flex items-start gap-3 rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-primary-bg"
                    >
                      <input
                        checked={levelSubjectIds.includes(subject.id)}
                        className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                        name="levelSubjectIds"
                        onChange={(event) => {
                          setLevelSubjectIds((current) => {
                            if (event.target.checked) {
                              return [...current, subject.id]
                            }

                            return current.filter((item) => item !== subject.id)
                          })
                        }}
                        type="checkbox"
                        value={subject.id}
                      />
                      <span>{subject.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm text-text-muted">
            Tipo de recurso
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
              name="resourceTypeId"
              onChange={(event) => setResourceTypeId(event.target.value)}
              required
              value={resourceTypeId}
            >
              <option value="">Selecciona un tipo de recurso</option>
              {resourceTypes.map((resourceType) => (
                <option key={resourceType.id} value={resourceType.id}>
                  {resourceType.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-text-muted">
            Dificultad
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
              name="difficultyId"
              onChange={(event) => setDifficultyId(event.target.value)}
              required
              value={difficultyId}
            >
              <option value="">Selecciona una dificultad</option>
              {difficultyLevels.map((difficultyLevel) => (
                <option key={difficultyLevel.id} value={difficultyLevel.id}>
                  {difficultyLevel.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-text-muted">
            Modalidad
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
              name="modalityId"
              onChange={(event) => setModalityId(event.target.value)}
              required
              value={modalityId}
            >
              <option value="">Selecciona una modalidad</option>
              {modalities.map((modality) => (
                <option key={modality.id} value={modality.id}>
                  {modality.name}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm text-text-muted">
              Objetivos de Aprendizaje
            </legend>
            <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
              {learningObjectivesDisabled ? (
                <p className="text-sm text-disabled-text">
                  Selecciona una asignatura para ver los objetivos.
                </p>
              ) : (
                <div className="grid gap-3">
                  {learningObjectives.map((objective) => (
                    <label
                      key={objective.id}
                      className="flex items-start gap-3 rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-primary-bg"
                    >
                      <input
                        checked={learningObjectiveIds.includes(objective.id)}
                        className="mt-0.5 h-4 w-4 accent-[var(--color-primary)]"
                        name="learningObjectiveIds"
                        onChange={(event) => {
                          setLearningObjectiveIds((current) => {
                            if (event.target.checked) {
                              return [...current, objective.id]
                            }

                            return current.filter((item) => item !== objective.id)
                          })
                        }}
                        type="checkbox"
                        value={objective.id}
                      />
                      <span>{objective.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          {requiresQuestionCount ? (
            <label className="grid gap-2 text-sm text-text-muted">
              Cantidad de preguntas
              <input
                className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
                max={20}
                min={1}
                name="questionCount"
                onChange={(event) => setQuestionCount(event.target.value)}
                required
                type="number"
                value={questionCount}
              />
            </label>
          ) : null}

          {isProjectResource ? (
            <label className="grid gap-2 text-sm text-text-muted">
              Cantidad de clases
              <input
                className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
                min={1}
                name="estimatedClassCount"
                onChange={(event) => setEstimatedClassCount(event.target.value)}
                required
                type="number"
                value={estimatedClassCount}
              />
            </label>
          ) : null}

          {state.error ? <p className="text-sm text-error">{state.error}</p> : null}

          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text"
            disabled={pending}
            type="submit"
          >
            {pending ? 'Generando...' : 'Generar evaluacion'}
          </button>
        </div>
      </form>

      {pending ? (
        <section className="mt-8 rounded-lg border border-border bg-primary-bg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text">
            Estamos preparando tu evaluacion
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Estamos organizando el contenido para que el resultado sea claro,
            util y alineado con los objetivos seleccionados.
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-soft">
            <div
              aria-hidden="true"
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>

          <p
            aria-live="polite"
            className="mt-4 text-sm font-medium text-primary-hover"
          >
            {loadingMessages[loadingStep]}
          </p>
        </section>
      ) : null}

      {state.content ? (
        <section className="mt-8 rounded-lg border border-border bg-surface p-6 text-text shadow-sm">
          <h2 className="text-xl font-semibold text-text">Resultado generado</h2>
          <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-text">
            {state.content}
          </pre>
        </section>
      ) : null}
    </>
  )
}
