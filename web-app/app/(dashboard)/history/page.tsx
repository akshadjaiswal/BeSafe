"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, Download, Filter, CheckCircle, AlertTriangle, XCircle, Timer } from "lucide-react"
import { format, subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { exportToCSV } from "@/lib/utils/export-csv"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { JourneyWithRoute, JourneyStatus } from "@/types"

const statusConfig: Record<JourneyStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
  completed: { label: "Completed", variant: "success", icon: CheckCircle },
  active: { label: "Active", variant: "warning", icon: Timer },
  timeout_alert_sent: { label: "Alert Sent", variant: "destructive", icon: AlertTriangle },
  cancelled: { label: "Cancelled", variant: "outline", icon: XCircle },
}

// DEMO MODE - TEMPORARY
const now = new Date()
const DEMO_ROUTE_MORNING = {
  id: "demo-route-1",
  user_id: "demo-user-id",
  name: "Morning Commute",
  departure_location: { lat: 19.076, lng: 72.8777, address: "Home - Andheri West", radius: 200 },
  destination_location: { lat: 19.0176, lng: 72.8562, address: "Office - Lower Parel", radius: 200 },
  active_days: [1, 2, 3, 4, 5],
  expected_duration_mins: 45,
  is_active: true,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
}
const DEMO_ROUTE_EVENING = {
  id: "demo-route-2",
  user_id: "demo-user-id",
  name: "Evening Return",
  departure_location: { lat: 19.0176, lng: 72.8562, address: "Office - Lower Parel", radius: 200 },
  destination_location: { lat: 19.076, lng: 72.8777, address: "Home - Andheri West", radius: 200 },
  active_days: [1, 2, 3, 4, 5],
  expected_duration_mins: 55,
  is_active: true,
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
}

function demoDate(daysAgo: number, hours: number, mins: number): string {
  const d = subDays(now, daysAgo)
  d.setHours(hours, mins, 0, 0)
  return d.toISOString()
}

const DEMO_JOURNEYS: JourneyWithRoute[] = [
  {
    id: "demo-j1", user_id: "demo-user-id", route_id: "demo-route-1",
    departure_time: demoDate(1, 8, 30), arrival_time: demoDate(1, 9, 12),
    expected_arrival_time: demoDate(1, 9, 15), status: "completed",
    last_known_location: null, created_at: demoDate(1, 8, 30), route: DEMO_ROUTE_MORNING,
  },
  {
    id: "demo-j2", user_id: "demo-user-id", route_id: "demo-route-2",
    departure_time: demoDate(1, 18, 0), arrival_time: demoDate(1, 18, 50),
    expected_arrival_time: demoDate(1, 18, 55), status: "completed",
    last_known_location: null, created_at: demoDate(1, 18, 0), route: DEMO_ROUTE_EVENING,
  },
  {
    id: "demo-j3", user_id: "demo-user-id", route_id: "demo-route-1",
    departure_time: demoDate(2, 8, 45), arrival_time: demoDate(2, 9, 28),
    expected_arrival_time: demoDate(2, 9, 30), status: "completed",
    last_known_location: null, created_at: demoDate(2, 8, 45), route: DEMO_ROUTE_MORNING,
  },
  {
    id: "demo-j4", user_id: "demo-user-id", route_id: "demo-route-2",
    departure_time: demoDate(2, 19, 15), arrival_time: null,
    expected_arrival_time: demoDate(2, 20, 10), status: "timeout_alert_sent",
    last_known_location: { lat: 19.05, lng: 72.87, timestamp: demoDate(2, 20, 5) },
    created_at: demoDate(2, 19, 15), route: DEMO_ROUTE_EVENING,
  },
  {
    id: "demo-j5", user_id: "demo-user-id", route_id: "demo-route-1",
    departure_time: demoDate(3, 8, 30), arrival_time: demoDate(3, 9, 18),
    expected_arrival_time: demoDate(3, 9, 15), status: "completed",
    last_known_location: null, created_at: demoDate(3, 8, 30), route: DEMO_ROUTE_MORNING,
  },
  {
    id: "demo-j6", user_id: "demo-user-id", route_id: "demo-route-2",
    departure_time: demoDate(4, 17, 30), arrival_time: null,
    expected_arrival_time: demoDate(4, 18, 25), status: "cancelled",
    last_known_location: null, created_at: demoDate(4, 17, 30), route: DEMO_ROUTE_EVENING,
  },
]
// END DEMO MODE

export default function HistoryPage() {
  const { user, isDemoMode } = useAuthStore() // DEMO MODE - TEMPORARY: added isDemoMode
  const [journeys, setJourneys] = useState<JourneyWithRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | "all">("all")

  useEffect(() => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      setJourneys(DEMO_JOURNEYS)
      setLoading(false)
      return
    }
    // END DEMO MODE

    if (!user) return
    const supabase = createClient()

    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

    supabase
      .from("journeys")
      .select("*, route:routes(*)")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJourneys((data as JourneyWithRoute[]) || [])
        setLoading(false)
      })
  }, [user, isDemoMode])

  const filteredJourneys =
    statusFilter === "all"
      ? journeys
      : journeys.filter((j) => j.status === statusFilter)

  const handleExport = () => {
    const exportData = filteredJourneys.map((j) => ({
      Date: format(new Date(j.created_at), "yyyy-MM-dd"),
      Route: j.route?.name || "Unknown",
      Departure: j.departure_time ? format(new Date(j.departure_time), "HH:mm") : "-",
      Arrival: j.arrival_time ? format(new Date(j.arrival_time), "HH:mm") : "-",
      Duration: j.arrival_time && j.departure_time
        ? `${Math.round((new Date(j.arrival_time).getTime() - new Date(j.departure_time).getTime()) / 60000)} min`
        : "-",
      Status: j.status,
    }))

    exportToCSV(exportData, `besafe-history-${format(new Date(), "yyyy-MM-dd")}`)
  }

  // Stats
  const completedCount = journeys.filter((j) => j.status === "completed").length
  const totalCount = journeys.length
  const onTimeRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-on">Journey History</h1>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredJourneys.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalCount}</p>
          <p className="text-xs text-surface-on-variant">Total Journeys</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-success">{completedCount}</p>
          <p className="text-xs text-surface-on-variant">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{onTimeRate}%</p>
          <p className="text-xs text-surface-on-variant">On-time Rate</p>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={staggerItem} className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-surface-on-variant shrink-0" />
        {(["all", "completed", "active", "timeout_alert_sent", "cancelled"] as const).map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ease-material ${
                statusFilter === filter
                  ? "bg-primary text-primary-on"
                  : "bg-surface-container text-surface-on-variant hover:bg-surface-container-highest"
              }`}
            >
              {filter === "all" ? "All" : statusConfig[filter].label}
            </button>
          )
        )}
      </motion.div>

      {/* Journey List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-3xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : filteredJourneys.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary-on-container" />
            </div>
            <h3 className="text-lg font-medium text-surface-on mb-2">No Journeys</h3>
            <p className="text-surface-on-variant">
              {statusFilter !== "all"
                ? "No journeys match the current filter."
                : "Your journey history will appear here once you start commuting."}
            </p>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {filteredJourneys.map((journey) => {
            const config = statusConfig[journey.status]
            const StatusIcon = config.icon
            const departureDate = new Date(journey.departure_time)
            const arrivalDate = journey.arrival_time ? new Date(journey.arrival_time) : null
            const durationMins = arrivalDate
              ? Math.round((arrivalDate.getTime() - departureDate.getTime()) / 60000)
              : null

            return (
              <motion.div key={journey.id} variants={staggerItem}>
                <Card className="hover:shadow-elevation-1 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="shrink-0">
                        <StatusIcon
                          className={`w-5 h-5 ${
                            config.variant === "success"
                              ? "text-success"
                              : config.variant === "warning"
                                ? "text-warning"
                                : config.variant === "destructive"
                                  ? "text-error"
                                  : "text-surface-on-variant"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-surface-on truncate">
                            {journey.route?.name || "Unknown Route"}
                          </p>
                          <Badge variant={config.variant} className="shrink-0">
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-surface-on-variant">
                          <span>{format(departureDate, "MMM d, yyyy")}</span>
                          <span>
                            {format(departureDate, "h:mm a")}
                            {arrivalDate ? ` → ${format(arrivalDate, "h:mm a")}` : ""}
                          </span>
                          {durationMins !== null && (
                            <span>{durationMins} min</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
