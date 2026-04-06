'use server'

import { generateEducationalTest } from '@/lib/openai/generator'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export type GeneratorState = {
  content: string
  error: string
}

type SubjectJoin = {
  name: string
} | null

const resourceTypesWithQuestions = new Set(['evaluacion'])

export async function generateEducationalTestAction(
  _prevState: GeneratorState,
  formData: FormData
): Promise<GeneratorState> {
  const resourceTypeId = String(formData.get('resourceTypeId') ?? '').trim()
  const difficultyId = String(formData.get('difficultyId') ?? '').trim()
  const modalityId = String(formData.get('modalityId') ?? '').trim()
  const levelId = String(formData.get('levelId') ?? '').trim()
  const levelSubjectIds = formData
    .getAll('levelSubjectIds')
    .map((value) => String(value).trim())
    .filter(Boolean)
  const learningObjectiveIds = formData
    .getAll('learningObjectiveIds')
    .map((value) => String(value).trim())
    .filter(Boolean)
  const questionCountValue = String(formData.get('questionCount') ?? '').trim()
  const questionCount = questionCountValue ? Number(questionCountValue) : null
  const estimatedClassCountValue = String(
    formData.get('estimatedClassCount') ?? ''
  ).trim()
  const estimatedClassCount = estimatedClassCountValue
    ? Number(estimatedClassCountValue)
    : null

  if (
    !resourceTypeId ||
    !difficultyId ||
    !modalityId ||
    !levelId ||
    !levelSubjectIds.length ||
    !learningObjectiveIds.length
  ) {
    return {
      content: '',
      error: 'Completa todos los campos requeridos.',
    }
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        content: '',
        error: 'Debes iniciar sesion para generar contenido.',
      }
    }

    const [
      { data: resourceType },
      { data: difficulty },
      { data: modality },
      { data: level },
      { data: levelSubjects },
      { data: learningObjectives },
    ] =
      await Promise.all([
        supabase
          .from('resource_types')
          .select('id, code, name')
          .eq('id', resourceTypeId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('difficulty_levels')
          .select('id, name')
          .eq('id', difficultyId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('modalities')
          .select('id, name')
          .eq('id', modalityId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('academic_levels')
          .select('id, name')
          .eq('id', levelId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('level_subjects')
          .select('id, level_id, subjects(name)')
          .in('id', levelSubjectIds)
          .eq('level_id', levelId)
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('learning_objectives')
          .select('id, level_subject_id, oa_code, title, description')
          .in('id', learningObjectiveIds)
          .in('level_subject_id', levelSubjectIds)
          .eq('is_active', true)
          .order('sort_order'),
      ])

    const subjects =
      (levelSubjects as
        | {
            id: string
            subjects: SubjectJoin | SubjectJoin[]
          }[]
        | null)
        ?.map((levelSubject) => {
          const subjectJoin = levelSubject.subjects as SubjectJoin | SubjectJoin[]
          const name = Array.isArray(subjectJoin)
            ? subjectJoin[0]?.name
            : subjectJoin?.name

          return {
            id: levelSubject.id,
            name,
          }
        })
        .filter((subject): subject is { id: string; name: string } =>
          Boolean(subject.name)
        ) ?? []

    if (
      !resourceType?.name ||
      !difficulty?.name ||
      !modality?.name ||
      !level?.name ||
      !subjects.length ||
      subjects.length !== levelSubjectIds.length ||
      !learningObjectives?.length ||
      learningObjectives.length !== learningObjectiveIds.length
    ) {
      return {
        content: '',
        error: 'No se pudo resolver el catalogo seleccionado.',
      }
    }

    const requiresQuestionCount = resourceTypesWithQuestions.has(resourceType.code)

    if (requiresQuestionCount) {
      if (!questionCount || !Number.isInteger(questionCount)) {
        return {
          content: '',
          error: 'Indica una cantidad de preguntas valida.',
        }
      }
    }

    if (resourceType.code === 'proyecto') {
      if (!estimatedClassCount || !Number.isInteger(estimatedClassCount)) {
        return {
          content: '',
          error: 'Indica una cantidad de clases valida para el proyecto.',
        }
      }
    }

    const boundedQuestionCount = requiresQuestionCount
      ? Math.min(Math.max(questionCount ?? 1, 1), 20)
      : null

    const objectiveTexts = learningObjectives.map((learningObjective) =>
      [learningObjective.oa_code, learningObjective.title, learningObjective.description]
        .filter(Boolean)
        .join(' - ')
    )

    const content = await generateEducationalTest({
      resourceType: resourceType.name,
      difficulty: difficulty.name,
      modality: modality.name,
      subjects: subjects.map((subject) => subject.name),
      level: level.name,
      objectives: objectiveTexts,
      questionCount: boundedQuestionCount,
      estimatedClassCount:
        resourceType.code === 'proyecto' && estimatedClassCount
          ? estimatedClassCount
          : null,
    })

    const primaryLevelSubjectId = levelSubjectIds[0]
    const primaryLearningObjectiveId = learningObjectiveIds[0]
    const { data: insertedContent, error: insertError } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        level_id: levelId,
        level_subject_id: primaryLevelSubjectId,
        learning_objective_id: primaryLearningObjectiveId,
        question_count: boundedQuestionCount,
        content,
        resource_type_id: resourceTypeId,
        difficulty_id: difficultyId,
        modality_id: modalityId,
        estimated_class_count:
          resourceType.code === 'proyecto' ? estimatedClassCount : null,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to save generated content:', insertError.message)
    } else if (insertedContent) {
      const { error: subjectsInsertError } = await supabase
        .from('generated_content_subjects')
        .insert(
          levelSubjectIds.map((levelSubjectId, index) => ({
            generated_content_id: insertedContent.id,
            level_subject_id: levelSubjectId,
            is_primary: index === 0,
            sort_order: index,
          }))
        )

      if (subjectsInsertError) {
        console.error(
          'Failed to save generated content subjects:',
          subjectsInsertError.message
        )
      }

      const { error: learningObjectivesInsertError } = await supabase
        .from('generated_content_learning_objectives')
        .insert(
          learningObjectiveIds.map((learningObjectiveId, index) => ({
            generated_content_id: insertedContent.id,
            learning_objective_id: learningObjectiveId,
            is_primary: index === 0,
            coverage_type: index === 0 ? 'primary' : 'secondary',
            sort_order: index,
          }))
        )

      if (learningObjectivesInsertError) {
        console.error(
          'Failed to save generated content learning objectives:',
          learningObjectivesInsertError.message
        )
      }
    }

    return {
      content,
      error: '',
    }
  } catch {
    return {
      content: '',
      error: 'No fue posible generar el contenido. Intenta nuevamente.',
    }
  }
}
