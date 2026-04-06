import Link from 'next/link'
import { redirect } from 'next/navigation'

import { registerAction } from '@/app/register/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

type RegisterPageViewProps = {
  error?: string
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const { error } = await searchParams

  return <RegisterPageView error={error} />
}

export function RegisterPageView({ error }: RegisterPageViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Registrarse
        </h1>

        <form action={registerAction} className="mt-8 flex flex-col gap-6">
          <label className="flex flex-col gap-2 text-sm text-text-muted">
            Correo electrónico
            <input
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-text-muted">
            Contraseña
            <input
              className="rounded-md border border-border bg-surface px-3 py-2 text-base text-text shadow-sm focus:border-primary focus:ring-2 focus:ring-primary-soft"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}

          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-sm text-text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link
            className="font-medium text-primary hover:text-primary-hover"
            href="/login"
          >
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  )
}
