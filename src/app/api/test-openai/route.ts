import { generateOpenAIHello } from '@/lib/openai/generator'

export async function GET() {
  try {
    const message = await generateOpenAIHello()

    return Response.json({ message })
  } catch {
    return Response.json(
      { error: 'Failed to generate OpenAI response' },
      { status: 500 }
    )
  }
}
