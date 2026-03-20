"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Plus, Navigation, ArrowRight, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { Route } from "@/types"

const dayLabels = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function RoutesPage() {
  const { user } = useAuthStore()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [user])

  const handleDelete = async (routeId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("routes").delete().eq("id", routeId)
    if (error) {
      toast.error("Failed to delete route")
      return
    }
    setRoutes((prev) => prev.filter((r) => r.id !== routeId))
    toast.success("Route deleted")
  }

  const toggleActive = async (route: Route) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("routes")
      .update({ is_active: !route.is_active })
      .eq("id", route.id)
    if (error) {
      toast.error("Failed to update route")
      return
    }
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === route.id ? { ...r, is_active: !r.is_active } : r
      )
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-on">Routes</h1>
        <Button asChild>
          <Link href="/routes/new">
            <Plus className="w-4 h-4 mr-2" />
            New Route
          </Link>
        </Button>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-primary-on-container" />
            </div>
            <h3 className="text-lg font-medium text-surface-on mb-2">No Routes</h3>
            <p className="text-surface-on-variant mb-6">Create your first route to get started.</p>
            <Button asChild>
              <Link href="/routes/new">
                <Plus className="w-4 h-4 mr-2" /> Create Route
              </Link>
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-4">
          {routes.map((route) => (
            <motion.div key={route.id} variants={staggerItem}>
              <Card className="hover:shadow-elevation-1 transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Link href={`/routes/${route.id}`} className="flex-1">
                      <CardTitle className="text-lg hover:text-primary transition-colors">
                        {route.name}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(route)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Badge variant={route.is_active ? "default" : "outline"}>
                          {route.is_active ? "Active" : "Paused"}
                        </Badge>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(route.id)}
                        className="text-error hover:bg-error-container"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/routes/${route.id}`} className="block space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-surface-on-variant">From:</span>
                      <span className="font-medium truncate">{route.departure_location.address}</span>
                      <ArrowRight className="w-3 h-3 text-surface-on-variant shrink-0" />
                      <span className="text-surface-on-variant">To:</span>
                      <span className="font-medium truncate">{route.destination_location.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                          <span
                            key={day}
                            className={`text-[10px] w-6 h-6 rounded-full flex items-center justify-center ${
                              route.active_days.includes(day)
                                ? "bg-primary-container text-primary-on-container font-medium"
                                : "text-surface-on-variant/30"
                            }`}
                          >
                            {dayLabels[day]?.[0]}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-surface-on-variant">
                        ~{route.expected_duration_mins} min
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
