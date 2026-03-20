import { create } from "zustand"
import type { Journey, Route } from "@/types"

interface JourneyState {
  activeJourney: Journey | null
  activeRoute: Route | null
  isMonitoring: boolean
  currentLocation: { lat: number; lng: number } | null
  distanceToDestination: number | null

  setActiveJourney: (journey: Journey | null) => void
  setActiveRoute: (route: Route | null) => void
  setMonitoring: (monitoring: boolean) => void
  setCurrentLocation: (location: { lat: number; lng: number } | null) => void
  setDistanceToDestination: (distance: number | null) => void
  reset: () => void
}

export const useJourneyStore = create<JourneyState>((set) => ({
  activeJourney: null,
  activeRoute: null,
  isMonitoring: false,
  currentLocation: null,
  distanceToDestination: null,

  setActiveJourney: (activeJourney) => set({ activeJourney }),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setMonitoring: (isMonitoring) => set({ isMonitoring }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setDistanceToDestination: (distanceToDestination) => set({ distanceToDestination }),
  reset: () =>
    set({
      activeJourney: null,
      activeRoute: null,
      isMonitoring: false,
      currentLocation: null,
      distanceToDestination: null,
    }),
}))
