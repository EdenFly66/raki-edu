import Link from 'next/link'
import { redirect } from 'next/navigation'

import { loginAction } from '@/app/login/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type LoginPageProps = {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

type LoginPageViewProps = {
  error?: string
  message?: string
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const { error, message } = await searchParams

  return <LoginPageView error={error} message={message} />
}

export function LoginPageView({ error, message }: LoginPageViewProps) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
      <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Iniciar sesión
        </h1>

        <form action={loginAction} className="mt-8 flex flex-col gap-6">
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
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm text-error">{error}</p> : null}
          {message ? <p className="text-sm text-success">{message}</p> : null}

          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            type="submit"
          >
            Ingresar
          </button>
        </form>

        <p className="mt-6 text-sm text-text-muted">
          ¿No tienes cuenta?{' '}
          <Link
            className="font-medium text-primary hover:text-primary-hover"
            href="/register"
          >
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  )
}
