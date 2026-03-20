"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { ArrowLeft, Clock, MapPin, Users, Trash2, Power } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { Route, Contact } from "@/types"

const MapView = dynamic(
  () => import("@/components/map/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-[300px] rounded-3xl bg-surface-container animate-pulse" /> }
)

const dayLabels = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function RouteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const routeId = params.id as string
  const supabase = createClient()

  const [route, setRoute] = useState<Route | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRoute = async () => {
      const { data: routeData } = await supabase
        .from("routes")
        .select("*")
        .eq("id", routeId)
        .single()

      if (routeData) {
        setRoute(routeData as Route)

        // Fetch associated contacts
        const { data: routeContacts } = await supabase
          .from("route_contacts")
          .select("contact_id")
          .eq("route_id", routeId)

        if (routeContacts && routeContacts.length > 0) {
          const contactIds = routeContacts.map((rc) => rc.contact_id)
          const { data: contactsData } = await supabase
            .from("contacts")
            .select("*")
            .in("id", contactIds)
          setContacts((contactsData as Contact[]) || [])
        }
      }
      setLoading(false)
    }

    fetchRoute()
  }, [routeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    const { error } = await supabase.from("routes").delete().eq("id", routeId)
    if (error) {
      toast.error("Failed to delete route")
      return
    }
    toast.success("Route deleted")
    router.push("/routes")
  }

  const toggleActive = async () => {
    if (!route) return
    const { error } = await supabase
      .from("routes")
      .update({ is_active: !route.is_active })
      .eq("id", routeId)
    if (error) {
      toast.error("Failed to update")
      return
    }
    setRoute({ ...route, is_active: !route.is_active })
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-10 w-48 bg-surface-container animate-pulse rounded-2xl" />
        <div className="h-[300px] bg-surface-container animate-pulse rounded-3xl" />
        <div className="h-40 bg-surface-container animate-pulse rounded-3xl" />
      </div>
    )
  }

  if (!route) {
    return (
      <div className="text-center py-20">
        <p className="text-surface-on-variant">Route not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/routes")}>
          Back to Routes
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-surface-on">{route.name}</h1>
            <Badge variant={route.is_active ? "default" : "outline"} className="mt-1">
              {route.is_active ? "Active" : "Paused"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={toggleActive} title={route.is_active ? "Pause" : "Activate"}>
            <Power className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-error hover:bg-error-container">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div variants={staggerItem}>
        <MapView
          departure={route.departure_location}
          destination={route.destination_location}
          interactive={false}
          className="w-full h-[300px]"
        />
      </motion.div>

      {/* Route Info */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Route Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low">
                <p className="text-xs text-surface-on-variant mb-1">Departure</p>
                <p className="text-sm font-medium">{route.departure_location.address}</p>
                <p className="text-xs text-surface-on-variant mt-1">Radius: {route.departure_location.radius}m</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-container-low">
                <p className="text-xs text-surface-on-variant mb-1">Destination</p>
                <p className="text-sm font-medium">{route.destination_location.address}</p>
                <p className="text-xs text-surface-on-variant mt-1">Radius: {route.destination_location.radius}m</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-surface-on-variant" />
              <span className="text-sm">Expected duration: {route.expected_duration_mins} minutes</span>
            </div>

            <div>
              <p className="text-sm text-surface-on-variant mb-2">Active on:</p>
              <div className="flex flex-wrap gap-2">
                {route.active_days.sort().map((day) => (
                  <Badge key={day} variant="secondary">
                    {dayLabels[day]}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contacts */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Notification Contacts ({contacts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-surface-on-variant">No contacts assigned to this route.</p>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-sm font-medium text-secondary-on-container">
                      {contact.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-surface-on-variant">{contact.phone_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
