import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center rounded-2xl border border-border bg-primary-bg px-8 py-16 shadow-sm">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-text">
          Crea, practica y enseña con inteligencia artificial
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-muted">
          Plataforma educativa para docentes y estudiantes, basada en el currículum nacional
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-hover"
            href="/register"
          >
            Comenzar
          </Link>
        </div>
      </section>
    </main>
  )
}
