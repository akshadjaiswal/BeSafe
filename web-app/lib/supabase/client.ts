import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build/prerender, use placeholder values
    // The client won't work but won't crash the build
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
