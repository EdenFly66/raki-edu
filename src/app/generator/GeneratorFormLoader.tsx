'use client'

import dynamic from 'next/dynamic'

import type { AcademicLevelOption } from '@/app/generator/page'

type GeneratorFormLoaderProps = {
  levels: AcademicLevelOption[]
}

const GeneratorForm = dynamic(
  () =>
    import('@/app/generator/GeneratorForm').then((mod) => mod.GeneratorForm),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 grid gap-4">
        <div className="grid gap-2 text-sm">
          <span>Nivel</span>
          <div className="rounded-md border border-black/20 bg-black/5 px-3 py-2 text-black/50">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Asignatura</span>
          <div className="rounded-md border border-black/20 bg-black/5 px-3 py-2 text-black/50">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Objetivo de Aprendizaje</span>
          <div className="rounded-md border border-black/20 bg-black/5 px-3 py-2 text-black/50">
            Cargando formulario...
          </div>
        </div>
        <div className="grid gap-2 text-sm">
          <span>Cantidad de Preguntas</span>
          <div className="rounded-md border border-black/20 bg-black/5 px-3 py-2 text-black/50">
            Cargando formulario...
          </div>
        </div>
      </div>
    ),
  }
)

export function GeneratorFormLoader({ levels }: GeneratorFormLoaderProps) {
  return <GeneratorForm levels={levels} />
}
