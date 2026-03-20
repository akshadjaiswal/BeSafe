import { calculateDistance, isInsideGeofence } from "./haversine"
import type { Route } from "@/types"

export type GeofenceEvent =
  | { type: "departure_detected"; route: Route; position: GeolocationPosition }
  | { type: "arrival_detected"; route: Route; position: GeolocationPosition }
  | { type: "location_update"; position: GeolocationPosition; distanceToDestination: number }
  | { type: "error"; error: GeolocationPositionError }

type EventHandler = (event: GeofenceEvent) => void

export class GeofenceMonitor {
  private watchId: number | null = null
  private handlers: EventHandler[] = []
  private wasDeparted: Map<string, boolean> = new Map()
  private activeRouteId: string | null = null

  on(handler: EventHandler) {
    this.handlers.push(handler)
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler)
    }
  }

  private emit(event: GeofenceEvent) {
    this.handlers.forEach((h) => h(event))
  }

  /**
   * Start monitoring geofences for active routes.
   * Checks if user is currently inside departure geofences to detect exits.
   */
  startMonitoring(routes: Route[]) {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported")
      return
    }

    // Stop existing monitoring
    this.stopMonitoring()

    const activeRoutes = routes.filter((r) => r.is_active)
    if (activeRoutes.length === 0) return

    // Initial position check to set departure state
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        activeRoutes.forEach((route) => {
          const insideDeparture = isInsideGeofence(
            pos.coords.latitude,
            pos.coords.longitude,
            {
              lat: route.departure_location.lat,
              lng: route.departure_location.lng,
              radius: route.departure_location.radius,
            }
          )
          this.wasDeparted.set(route.id, insideDeparture)
        })
      },
      () => {}, // ignore initial error
      { enableHighAccuracy: false, timeout: 10000 }
    )

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.handlePositionUpdate(position, activeRoutes)
      },
      (error) => {
        this.emit({ type: "error", error })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    )
  }

  private handlePositionUpdate(position: GeolocationPosition, routes: Route[]) {
    const { latitude, longitude } = position.coords

    routes.forEach((route) => {
      const wasInDeparture = this.wasDeparted.get(route.id) ?? false

      const insideDeparture = isInsideGeofence(latitude, longitude, {
        lat: route.departure_location.lat,
        lng: route.departure_location.lng,
        radius: route.departure_location.radius,
      })

      const insideDestination = isInsideGeofence(latitude, longitude, {
        lat: route.destination_location.lat,
        lng: route.destination_location.lng,
        radius: route.destination_location.radius,
      })

      // Check if route is active today
      const today = new Date().getDay() || 7 // Sunday = 7
      if (!route.active_days.includes(today)) return

      // Departure detection: was inside departure, now outside
      if (wasInDeparture && !insideDeparture && !this.activeRouteId) {
        this.activeRouteId = route.id
        this.emit({ type: "departure_detected", route, position })
      }

      // Update departure state
      this.wasDeparted.set(route.id, insideDeparture)

      // Arrival detection: user enters destination geofence during active journey
      if (this.activeRouteId === route.id && insideDestination) {
        this.activeRouteId = null
        this.emit({ type: "arrival_detected", route, position })
      }

      // Location update during active journey
      if (this.activeRouteId === route.id) {
        const distanceToDestination = calculateDistance(
          latitude,
          longitude,
          route.destination_location.lat,
          route.destination_location.lng
        )
        this.emit({ type: "location_update", position, distanceToDestination })
      }
    })
  }

  stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
    this.activeRouteId = null
    this.wasDeparted.clear()
  }

  isMonitoring(): boolean {
    return this.watchId !== null
  }

  getActiveRouteId(): string | null {
    return this.activeRouteId
  }

  setActiveRoute(routeId: string | null) {
    this.activeRouteId = routeId
  }
}

// Singleton instance
export const geofenceMonitor = new GeofenceMonitor()
