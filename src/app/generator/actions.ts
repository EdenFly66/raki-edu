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

export async function generateEducationalTestAction(
  _prevState: GeneratorState,
  formData: FormData
): Promise<GeneratorState> {
  const levelId = String(formData.get('levelId') ?? '').trim()
  const levelSubjectId = String(formData.get('levelSubjectId') ?? '').trim()
  const learningObjectiveId = String(formData.get('learningObjectiveId') ?? '').trim()
  const questionCount = Number(formData.get('questionCount') ?? 0)

  if (
    !levelId ||
    !levelSubjectId ||
    !learningObjectiveId ||
    !Number.isInteger(questionCount)
  ) {
    return {
      content: '',
      error: 'Completa todos los campos con una cantidad de preguntas valida.',
    }
  }

  try {
    const supabase = await createServerSupabaseClient()

    const [{ data: level }, { data: levelSubject }, { data: learningObjective }] =
      await Promise.all([
        supabase
          .from('academic_levels')
          .select('id, name')
          .eq('id', levelId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('level_subjects')
          .select('id, level_id, subjects(name)')
          .eq('id', levelSubjectId)
          .eq('level_id', levelId)
          .eq('is_active', true)
          .single(),
        supabase
          .from('learning_objectives')
          .select('id, level_subject_id, oa_code, title, description')
          .eq('id', learningObjectiveId)
          .eq('level_subject_id', levelSubjectId)
          .eq('is_active', true)
          .single(),
      ])

    const subjectJoin = levelSubject?.subjects as SubjectJoin | SubjectJoin[]
    const subject = Array.isArray(subjectJoin)
      ? subjectJoin[0]?.name
      : subjectJoin?.name

    if (!level?.name || !subject || !learningObjective?.title) {
      return {
        content: '',
        error: 'No se pudo resolver el catalogo seleccionado.',
      }
    }

    const objective = [learningObjective.oa_code, learningObjective.title, learningObjective.description]
      .filter(Boolean)
      .join(' - ')

    const content = await generateEducationalTest({
      subject,
      level: level.name,
      objective,
      questionCount: Math.min(Math.max(questionCount, 1), 20),
    })

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
