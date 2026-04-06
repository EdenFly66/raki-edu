import 'server-only'

import { openai } from '@/lib/openai/client'

type EducationalTestInput = {
  resourceType: string
  difficulty: string
  modality: string
  subjects: string[]
  level: string
  objectives: string[]
  questionCount: number | null
  estimatedClassCount: number | null
}

export async function generateOpenAIHello() {
  const response = await openai.responses.create({
    model: 'gpt-5',
    input: 'Say hello',
  })

  console.log('OpenAI response:', response.output_text)

  return response.output_text
}

export async function generateEducationalTest({
  resourceType,
  difficulty,
  modality,
  subjects,
  level,
  objectives,
  questionCount,
  estimatedClassCount,
}: EducationalTestInput) {
  const subjectBlock = subjects.map((subject, index) => `${index + 1}. ${subject}`).join('\n')
  const objectiveBlock = objectives.map((objective, index) => `${index + 1}. ${objective}`).join('\n')
  const classCountLine = estimatedClassCount
    ? `Cantidad de clases estimada: ${estimatedClassCount}\n`
    : ''
  const questionCountLine =
    questionCount !== null ? `Cantidad de preguntas: ${questionCount}\n` : ''
  const questionRequirement =
    questionCount !== null
      ? `- Si se indica una cantidad de preguntas, incluye exactamente ${questionCount} preguntas o actividades, segun corresponda.`
      : '- Si no se indica una cantidad de preguntas, define la estructura mas adecuada para el tipo de recurso.'

  const response = await openai.responses.create({
    model: 'gpt-5',
    input: `Genera una evaluacion educativa en espanol, en formato de texto estructurado, usando este contexto curricular.

Tipo de recurso: ${resourceType}
Dificultad: ${difficulty}
Modalidad: ${modality}
Nivel: ${level}
Asignaturas:
${subjectBlock}
Objetivos de Aprendizaje:
${objectiveBlock}
${questionCountLine}
${classCountLine}

Requisitos:
- Escribe todo en espanol.
- Alinea el recurso a los objetivos de aprendizaje seleccionados.
- Integra de forma coherente las asignaturas seleccionadas.
- Si el tipo de recurso es "Proyecto", organiza la propuesta por clases y considera la cantidad de clases indicada.
${questionRequirement}
- Usa un nivel de dificultad adecuado para ${level}.
- Manten un formato claro y reutilizable por un docente.
- Ajusta el tono y la estructura a la modalidad ${modality} y la dificultad ${difficulty}.

Devuelve solo este formato:
Titulo
Instrucciones
Desarrollo
Respuestas`,
  })

  console.log('Generated educational test:', response.output_text)

  return response.output_text
}
