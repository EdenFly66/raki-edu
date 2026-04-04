import Link from 'next/link'
import { redirect } from 'next/navigation'

import { registerAction } from '@/app/register/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string
  }>
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

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>

      <form action={registerAction} className="mt-8 flex flex-col gap-4">
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
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
          type="submit"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account?{' '}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  )
}
