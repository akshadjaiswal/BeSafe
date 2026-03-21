import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/types"

// DEMO MODE - TEMPORARY
const DEMO_USER = {
  id: "demo-user-id",
  email: "demo@besafe.app",
  app_metadata: {},
  user_metadata: { full_name: "Demo User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User

const DEMO_PROFILE: Profile = {
  id: "demo-user-id",
  full_name: "Demo User",
  phone_number: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
// END DEMO MODE

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isDemoMode: boolean // DEMO MODE - TEMPORARY
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
  loginAsDemo: () => void // DEMO MODE - TEMPORARY
  exitDemo: () => void // DEMO MODE - TEMPORARY
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isLoading: true,
      isDemoMode: false, // DEMO MODE - TEMPORARY
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, profile: null, isDemoMode: false }),
      // DEMO MODE - TEMPORARY
      loginAsDemo: () =>
        set({
          user: DEMO_USER,
          profile: DEMO_PROFILE,
          isDemoMode: true,
          isLoading: false,
        }),
      exitDemo: () =>
        set({
          user: null,
          profile: null,
          isDemoMode: false,
          isLoading: false,
        }),
      // END DEMO MODE
    }),
    {
      name: "besafe-auth",
      partialize: (state) => ({ isDemoMode: state.isDemoMode }), // DEMO MODE - TEMPORARY
    }
  )
)
