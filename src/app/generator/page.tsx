import { GeneratorForm } from '@/app/generator/GeneratorForm'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export type AcademicLevelOption = {
  id: string
  name: string
}

export default async function GeneratorPage() {
  const supabase = await createServerSupabaseClient()
  const { data: levels } = await supabase
    .from('academic_levels')
    .select('id, name, sort_order')
    .eq('is_active', true)
    .order('sort_order')

  const levelOptions: AcademicLevelOption[] =
    levels?.map(({ id, name }) => ({ id, name })) ?? []

  return <GeneratorForm levels={levelOptions} />
}
