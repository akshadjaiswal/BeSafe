"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { createClient } from "@/lib/supabase/client"

export function useAuth() {
  const { user, profile, isLoading, isDemoMode } = useAuthStore() // DEMO MODE - TEMPORARY: added isDemoMode

  const signOut = async () => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      useAuthStore.getState().exitDemo()
      window.location.href = "/"
      return
    }
    // END DEMO MODE

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
    isDemoMode, // DEMO MODE - TEMPORARY
    isAuthenticated: !!user || isDemoMode, // DEMO MODE - TEMPORARY: added isDemoMode check
    signOut,
  }
}
