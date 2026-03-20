"use client"

import { useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useJourneyStore } from "@/lib/stores/journey-store"
import { geofenceMonitor, type GeofenceEvent } from "@/lib/geo/geofence-monitor"
import {
  startJourney,
  completeJourney,
  cancelJourney,
  updateJourneyLocation,
  getActiveJourney,
} from "@/lib/geo/journey-manager"
import { createClient } from "@/lib/supabase/client"
import type { Route } from "@/types"

export function useJourneyMonitor() {
  const { user, profile } = useAuthStore()
  const {
    activeJourney,
    isMonitoring,
    setActiveJourney,
    setActiveRoute,
    setMonitoring,
    setCurrentLocation,
    setDistanceToDestination,
    reset,
  } = useJourneyStore()

  const routesRef = useRef<Route[]>([])

  // Handle geofence events
  const handleGeofenceEvent = useCallback(
    async (event: GeofenceEvent) => {
      if (!user) return

      switch (event.type) {
        case "departure_detected": {
          const journey = await startJourney(event.route, user.id, new Date())
          if (journey) {
            setActiveJourney(journey)
            setActiveRoute(event.route)
            toast.info(`Journey started: tracking your trip to ${event.route.destination_location.address || "destination"}`)
          }
          break
        }

        case "arrival_detected": {
          if (activeJourney) {
            await completeJourney(activeJourney.id)

            // Send arrival notification
            try {
              await fetch("/api/notifications/send-arrival", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  journey_id: activeJourney.id,
                  user_name: profile?.full_name || "User",
                }),
              })
              toast.success("Your contacts have been notified! ✅")
            } catch {
              toast.error("Failed to send notifications")
            }

            reset()
          }
          break
        }

        case "location_update": {
          const { latitude, longitude } = event.position.coords
          setCurrentLocation({ lat: latitude, lng: longitude })
          setDistanceToDestination(event.distanceToDestination)

          // Update journey location in database
          if (activeJourney) {
            await updateJourneyLocation(activeJourney.id, latitude, longitude)
          }
          break
        }

        case "error": {
          console.error("Geofence error:", event.error)
          if (event.error.code === 1) {
            toast.error("Location permission denied. BeSafe needs location access to work.")
          }
          break
        }
      }
    },
    [user, profile, activeJourney, setActiveJourney, setActiveRoute, setCurrentLocation, setDistanceToDestination, reset]
  )

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    if (!user || isMonitoring) return

    const supabase = createClient()
    const { data } = await supabase
      .from("routes")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)

    const routes = (data as Route[]) || []
    routesRef.current = routes

    if (routes.length === 0) return

    // Check for existing active journey
    const existingJourney = await getActiveJourney(user.id)
    if (existingJourney) {
      setActiveJourney(existingJourney)
      const route = routes.find((r) => r.id === existingJourney.route_id)
      if (route) {
        setActiveRoute(route)
        geofenceMonitor.setActiveRoute(route.id)
      }
    }

    geofenceMonitor.startMonitoring(routes)
    setMonitoring(true)
  }, [user, isMonitoring, setActiveJourney, setActiveRoute, setMonitoring])

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    geofenceMonitor.stopMonitoring()
    setMonitoring(false)
  }, [setMonitoring])

  // Cancel current journey
  const handleCancelJourney = useCallback(async () => {
    if (activeJourney) {
      await cancelJourney(activeJourney.id)
      geofenceMonitor.setActiveRoute(null)
      reset()
      toast.info("Journey cancelled")
    }
  }, [activeJourney, reset])

  // Subscribe to geofence events
  useEffect(() => {
    const unsubscribe = geofenceMonitor.on(handleGeofenceEvent)
    return unsubscribe
  }, [handleGeofenceEvent])

  // Auto-start monitoring when user is authenticated
  useEffect(() => {
    if (user && !isMonitoring) {
      startMonitoring()
    }
    return () => {
      stopMonitoring()
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    startMonitoring,
    stopMonitoring,
    cancelJourney: handleCancelJourney,
  }
}
