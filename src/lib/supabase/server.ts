import { createClient } from '@supabase/supabase-js'

import { supabaseConfig } from '@/lib/supabase/config'

export function createServerSupabaseClient() {
  return createClient(supabaseConfig.url, supabaseConfig.anonKey)
}
