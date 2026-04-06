'use client'

import dynamic from 'next/dynamic'

import type {
  AcademicLevelOption,
  GeneratorCatalogOption,
} from '@/app/generator/page'

type GeneratorFormLoaderProps = {
  levels: AcademicLevelOption[]
  resourceTypes: GeneratorCatalogOption[]
  difficultyLevels: GeneratorCatalogOption[]
  modalities: GeneratorCatalogOption[]
  initialResourceTypeId: string
}

const GeneratorForm = dynamic(
  () =>
    import('@/app/generator/GeneratorForm').then((mod) => mod.GeneratorForm),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 grid gap-4">
        <div className="grid gap-2 text-sm">
          <span>Tipo de recurso</span>
          <div className="rounded-md border border-border bg-primary-bg px-3 py-2 text-text-muted">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Nivel</span>
          <div className="rounded-md border border-border bg-primary-bg px-3 py-2 text-text-muted">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Asignaturas</span>
          <div className="rounded-md border border-border bg-primary-bg px-3 py-2 text-text-muted">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Objetivos de Aprendizaje</span>
          <div className="rounded-md border border-border bg-primary-bg px-3 py-2 text-text-muted">
            Cargando formulario...
          </div>
        </div>
      </div>
    ),
  }
)

export function GeneratorFormLoader({
  levels,
  resourceTypes,
  difficultyLevels,
  initialResourceTypeId,
  modalities,
}: GeneratorFormLoaderProps) {
  return (
    <GeneratorForm
      difficultyLevels={difficultyLevels}
      initialResourceTypeId={initialResourceTypeId}
      levels={levels}
      modalities={modalities}
      resourceTypes={resourceTypes}
    />
  )
}
