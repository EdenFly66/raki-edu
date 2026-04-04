'use client'

import { createBrowserClient } from '@supabase/ssr'

import { supabaseConfig } from '@/lib/supabase/config'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createBrowserSupabaseClient() {
  browserClient ??= createBrowserClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey
  )

  return browserClient
}
