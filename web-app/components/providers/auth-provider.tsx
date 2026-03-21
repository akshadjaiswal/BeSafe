"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const { setUser, setProfile, setLoading, signOut: clearAuth } = useAuthStore()

  useEffect(() => {
    // DEMO MODE - TEMPORARY: Skip Supabase init if in demo mode
    if (useAuthStore.getState().isDemoMode) {
      setLoading(false)
      setInitialized(true)
      return
    }
    // END DEMO MODE

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setLoading(false)
      setInitialized(true)
      return
    }

    const supabase = createClient()

    const getInitialSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          setProfile(data as Profile | null)
        }
      } catch {
        // Supabase not configured or network error
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single()
          setProfile(data as Profile | null)
        } else {
          setProfile(null)
        }

        if (event === "SIGNED_OUT") {
          clearAuth()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!initialized) {
    return <>{children}</>
  }

  return <>{children}</>
}
