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
    input: `Create an educational test in structured text format.

Subject: ${subject}
Level: ${level}
Objective: ${objective}
Number of questions: ${questionCount}

Return only:
Title
Instructions
Questions
Answer Key`,
  })

  console.log('Generated educational test:', response.output_text)

  return response.output_text
}
