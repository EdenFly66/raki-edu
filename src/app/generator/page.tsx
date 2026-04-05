import { GeneratorFormLoader } from '@/app/generator/GeneratorFormLoader'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AcademicLevelOption = {
  id: string
  name: string
}

export default async function GeneratorPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: levels } = await supabase
    .from('academic_levels')
    .select('id, name, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  const levelOptions: AcademicLevelOption[] =
    levels?.map(({ id, name }) => ({ id, name })) ?? []

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <h1 className="text-2xl font-semibold">Generador de Evaluaciones</h1>
      <GeneratorFormLoader levels={levelOptions} />
    </main>
  )
}
