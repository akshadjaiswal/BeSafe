"use client"

import { motion } from "framer-motion"
import { Navigation, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useJourneyStore } from "@/lib/stores/journey-store"
import { useJourneyMonitor } from "@/hooks/use-journey"

export function ActiveJourneyCard() {
  const { activeJourney, activeRoute, distanceToDestination } = useJourneyStore()
  const { cancelJourney } = useJourneyMonitor()

  if (!activeJourney || !activeRoute) return null

  const departureTime = new Date(activeJourney.departure_time)
  const expectedArrival = new Date(activeJourney.expected_arrival_time)
  const now = new Date()
  const elapsed = now.getTime() - departureTime.getTime()
  const total = expectedArrival.getTime() - departureTime.getTime()
  const progress = Math.min(1, Math.max(0, elapsed / total))

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const formatDistance = (meters: number) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`
    return `${Math.round(meters)} m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
    >
      <Card className="bg-primary-container border-none mb-6">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-primary-on" />
                </div>
                <div className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
              </div>
              <div>
                <p className="font-medium text-primary-on-container">Journey Active</p>
                <p className="text-sm text-primary-on-container/70">{activeRoute.name}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelJourney}
              className="text-primary-on-container hover:bg-primary/10"
              title="Cancel journey"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
              />
            </div>
            <div className="flex justify-between text-xs text-primary-on-container/60">
              <span>Left at {formatTime(departureTime)}</span>
              <span>ETA {formatTime(expectedArrival)}</span>
            </div>
          </div>

          {/* Distance info */}
          {distanceToDestination !== null && (
            <div className="flex items-center gap-2 text-sm text-primary-on-container/70">
              <MapPin className="w-3 h-3" />
              <span>{formatDistance(distanceToDestination)} to destination</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
