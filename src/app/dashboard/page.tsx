import { redirect } from 'next/navigation'

import { logoutAction } from '@/app/dashboard/actions'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        <form action={logoutAction}>
          <button
            className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>

      <p className="mt-8 text-sm text-black/70">Signed in as {user.email}</p>
    </main>
  )
}
