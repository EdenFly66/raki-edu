import 'server-only'

import { openai } from '@/lib/openai/client'

type EducationalTestInput = {
  subject: string
  level: string
  objective: string
  questionCount: number
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
  subject,
  level,
  objective,
  questionCount,
}: EducationalTestInput) {
  const response = await openai.responses.create({
    model: 'gpt-5',
    input: `Genera una evaluacion educativa en espanol, en formato de texto estructurado, usando este contexto curricular.

Nivel: ${level}
Asignatura: ${subject}
Objetivo de Aprendizaje: ${objective}
Cantidad de Preguntas: ${questionCount}

Requisitos:
- Escribe todo en espanol.
- Alinea las preguntas al objetivo de aprendizaje seleccionado.
- Incluye exactamente ${questionCount} preguntas.
- Usa un nivel de dificultad adecuado para ${level}.
- Manten un formato claro y reutilizable por un docente.

Devuelve solo este formato:
Titulo
Instrucciones
Preguntas
Respuestas`,
  })

  console.log('Generated educational test:', response.output_text)

  return response.output_text
}
