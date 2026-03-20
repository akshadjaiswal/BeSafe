"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/lib/supabase/client"

export function useAuth() {
  const { user, profile, isLoading } = useAuthStore()

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // ignore errors during sign out
    }
    useAuthStore.getState().signOut()
    window.location.href = "/"
  }

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}
