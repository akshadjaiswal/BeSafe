"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, MapPin, ArrowRight, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { Route } from "@/types"

const dayLabels = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// DEMO MODE - TEMPORARY
const DEMO_ROUTES: Route[] = [
  {
    id: "demo-route-1",
    user_id: "demo-user-id",
    name: "Morning Commute",
    departure_location: {
      lat: 19.076,
      lng: 72.8777,
      address: "Home - Andheri West",
      radius: 200,
    },
    destination_location: {
      lat: 19.0176,
      lng: 72.8562,
      address: "Office - Lower Parel",
      radius: 200,
    },
    active_days: [1, 2, 3, 4, 5],
    expected_duration_mins: 45,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-route-2",
    user_id: "demo-user-id",
    name: "Evening Return",
    departure_location: {
      lat: 19.0176,
      lng: 72.8562,
      address: "Office - Lower Parel",
      radius: 200,
    },
    destination_location: {
      lat: 19.076,
      lng: 72.8777,
      address: "Home - Andheri West",
      radius: 200,
    },
    active_days: [1, 2, 3, 4, 5],
    expected_duration_mins: 55,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
// END DEMO MODE

export default function DashboardPage() {
  const { user, isDemoMode } = useAuthStore() // DEMO MODE - TEMPORARY: added isDemoMode
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      setRoutes(DEMO_ROUTES)
      setLoading(false)
      return
    }
    // END DEMO MODE

    if (!user) return
    const supabase = createClient()
    supabase
      .from("routes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRoutes((data as Route[]) || [])
        setLoading(false)
      })
  }, [user, isDemoMode]) // DEMO MODE - TEMPORARY: added isDemoMode dep

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-on">Your Routes</h1>
          <p className="text-surface-on-variant mt-1">Manage your commute routes</p>
        </div>
        <Button asChild>
          <Link href="/routes/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Route
          </Link>
        </Button>
      </motion.div>

      {/* Routes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-3xl bg-surface-container animate-pulse"
            />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-primary-on-container" />
            </div>
            <h3 className="text-lg font-medium text-surface-on mb-2">
              No Routes Yet
            </h3>
            <p className="text-surface-on-variant mb-6 max-w-sm mx-auto">
              Create your first route to start getting automatic safe arrival notifications.
            </p>
            <Button asChild>
              <Link href="/routes/new">
                <Plus className="w-4 h-4 mr-2" />
                Create First Route
              </Link>
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {routes.map((route) => (
            <motion.div key={route.id} variants={staggerItem}>
              <Link href={`/routes/${route.id}`}>
                <Card className="p-0 hover:shadow-elevation-2 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <Badge variant={route.is_active ? "default" : "outline"}>
                        {route.is_active ? "Active" : "Paused"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Route visualization */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div className="w-0.5 h-8 bg-outline-variant" />
                        <div className="w-3 h-3 rounded-full bg-tertiary" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <p className="text-xs text-surface-on-variant">From</p>
                          <p className="text-sm font-medium text-surface-on truncate">
                            {route.departure_location.address || "Departure"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-surface-on-variant">To</p>
                          <p className="text-sm font-medium text-surface-on truncate">
                            {route.destination_location.address || "Destination"}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-surface-on-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Active days */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                        <span
                          key={day}
                          className={`text-[10px] w-7 h-7 rounded-full flex items-center justify-center ${
                            route.active_days.includes(day)
                              ? "bg-primary-container text-primary-on-container font-medium"
                              : "text-surface-on-variant/40"
                          }`}
                        >
                          {dayLabels[day]?.[0]}
                        </span>
                      ))}
                    </div>

                    {/* Duration */}
                    <p className="text-xs text-surface-on-variant">
                      ~{route.expected_duration_mins} min journey
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
