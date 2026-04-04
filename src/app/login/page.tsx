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
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Login</h1>

      <form action={loginAction} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Email
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-2 text-sm">
          Password
          <input
            className="rounded-md border border-black/20 px-3 py-2"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}

        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          Sign in
        </button>
      </form>

      <p className="mt-6 text-sm">
        No account?{' '}
        <Link className="underline" href="/register">
          Create one
        </Link>
      </p>
    </main>
  )
}
