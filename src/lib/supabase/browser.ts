'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { supabaseConfig } from '@/lib/supabase/config'

let browserClient: SupabaseClient | null = null

export function createBrowserSupabaseClient() {
  browserClient ??= createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey
  )

  return browserClient
}
