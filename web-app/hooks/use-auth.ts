"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import type { Profile } from "@/types"

export function useAuth() {
  const { user, profile, isLoading, setUser, setProfile, setLoading, signOut: clearAuth } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
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
      } finally {
        setLoading(false)
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

  const signOut = async () => {
    await supabase.auth.signOut()
    clearAuth()
  }

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}
