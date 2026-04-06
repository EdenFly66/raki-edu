import { GeneratorFormLoader } from '@/app/generator/GeneratorFormLoader'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AcademicLevelOption = {
  id: string
  name: string
}

export type GeneratorCatalogOption = {
  id: string
  name: string
  code: string
}

type GeneratorPageProps = {
  searchParams: Promise<{
    resourceType?: string | string[]
  }>
}

export default async function GeneratorPage({
  searchParams,
}: GeneratorPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [
    { data: levels },
    { data: resourceTypes },
    { data: difficultyLevels },
    { data: modalities },
  ] = await Promise.all([
    supabase
      .from('academic_levels')
      .select('id, name, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('resource_types')
      .select('id, name, code, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('difficulty_levels')
      .select('id, name, code, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('modalities')
      .select('id, name, code, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
  ])

  const levelOptions: AcademicLevelOption[] =
    levels?.map(({ id, name }) => ({ id, name })) ?? []
  const resourceTypeOptions: GeneratorCatalogOption[] =
    resourceTypes?.map(({ id, name, code }) => ({ id, name, code })) ?? []
  const difficultyOptions: GeneratorCatalogOption[] =
    difficultyLevels?.map(({ id, name, code }) => ({ id, name, code })) ?? []
  const modalityOptions: GeneratorCatalogOption[] =
    modalities?.map(({ id, name, code }) => ({ id, name, code })) ?? []
  const query = await searchParams
  const requestedResourceTypeCode = Array.isArray(query.resourceType)
    ? query.resourceType[0]
    : query.resourceType
  const initialResourceTypeId =
    resourceTypeOptions.find(
      (resourceType) => resourceType.code === requestedResourceTypeCode
    )?.id ?? ''

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight text-text">
        Generador de Evaluaciones
      </h1>
      <GeneratorFormLoader
        levels={levelOptions}
        resourceTypes={resourceTypeOptions}
        difficultyLevels={difficultyOptions}
        initialResourceTypeId={initialResourceTypeId}
        modalities={modalityOptions}
      />
    </main>
  )
}
