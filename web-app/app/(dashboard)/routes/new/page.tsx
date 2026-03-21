"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import {
  MapPin,
  Navigation,
  ArrowLeft,
  ArrowRight,
  Check,
  Minus,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { LocationSearch } from "@/components/map/location-search"
import type { Contact, Location } from "@/types"

const MapView = dynamic(
  () => import("@/components/map/map-view").then((m) => m.MapView),
  { ssr: false, loading: () => <div className="w-full h-[400px] rounded-3xl bg-surface-container animate-pulse" /> }
)

const dayOptions = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
]

export default function NewRoutePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number; _ts?: number } | null>(null)

  // Form state
  const [departure, setDeparture] = useState<Location | null>(null)
  const [destination, setDestination] = useState<Location | null>(null)
  const [departureRadius, setDepartureRadius] = useState(200)
  const [destinationRadius, setDestinationRadius] = useState(200)
  const [routeName, setRouteName] = useState("")
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [expectedDuration, setExpectedDuration] = useState(30)
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  // Fetch contacts
  useEffect(() => {
    if (!user) return
    supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => setContacts((data as Contact[]) || []))
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reverse geocode to get address via Nominatim (free, no API key)
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    }
  }, [])

  const handleMapClick = useCallback(
    async (lat: number, lng: number) => {
      const address = await reverseGeocode(lat, lng)
      if (step === 1) {
        setDeparture({ lat, lng, address, radius: departureRadius })
      } else if (step === 2) {
        setDestination({ lat, lng, address, radius: destinationRadius })
      }
    },
    [step, departureRadius, destinationRadius, reverseGeocode]
  )

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, address: string) => {
      if (step === 1) {
        setDeparture({ lat, lng, address, radius: departureRadius })
      } else if (step === 2) {
        setDestination({ lat, lng, address, radius: destinationRadius })
      }
      setFlyTarget({ lat, lng, zoom: 15, _ts: Date.now() })
    },
    [step, departureRadius, destinationRadius]
  )

  const toggleDay = (day: number) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleSubmit = async () => {
    if (!user || !departure || !destination || !routeName) {
      toast.error("Please complete all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const { data: route, error } = await supabase
        .from("routes")
        .insert({
          user_id: user.id,
          name: routeName,
          departure_location: { ...departure, radius: departureRadius },
          destination_location: { ...destination, radius: destinationRadius },
          active_days: activeDays.sort(),
          expected_duration_mins: expectedDuration,
        })
        .select()
        .single()

      if (error) throw error

      // Link selected contacts
      if (selectedContactIds.length > 0 && route) {
        await supabase.from("route_contacts").insert(
          selectedContactIds.map((contactId) => ({
            route_id: route.id,
            contact_id: contactId,
          }))
        )
      }

      toast.success("Route created successfully!")
      router.push("/dashboard")
    } catch (err) {
      toast.error("Failed to create route. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-on">New Route</h1>
          <p className="text-sm text-surface-on-variant">Step {step} of 4</p>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div variants={staggerItem} className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-primary" : "bg-outline-variant"
            }`}
          />
        ))}
      </motion.div>

      {/* Step 1: Departure Location */}
      {step === 1 && (
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-on" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Set Departure Location</h2>
                  <p className="text-sm text-surface-on-variant">
                    Search for a place or tap on the map
                  </p>
                </div>
              </div>

              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search departure location..."
              />

              <MapView
                onMapClick={handleMapClick}
                departure={departure}
                destination={null}
                flyToLocation={flyTarget}
              />

              {departure && (
                <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low">
                  <p className="text-sm font-medium">{departure.address}</p>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs whitespace-nowrap">Geofence Radius</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDepartureRadius(Math.max(50, departureRadius - 50))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-16 text-center">{departureRadius}m</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDepartureRadius(Math.min(500, departureRadius + 50))}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!departure}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Destination Location */}
      {step === 2 && (
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-tertiary-on" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Set Destination</h2>
                  <p className="text-sm text-surface-on-variant">
                    Search for a place or tap on the map
                  </p>
                </div>
              </div>

              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search destination..."
              />

              <MapView
                onMapClick={handleMapClick}
                departure={departure}
                destination={destination}
                flyToLocation={flyTarget}
              />

              {destination && (
                <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low">
                  <p className="text-sm font-medium">{destination.address}</p>
                  <div className="flex items-center gap-3">
                    <Label className="text-xs whitespace-nowrap">Geofence Radius</Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDestinationRadius(Math.max(50, destinationRadius - 50))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm font-medium w-16 text-center">{destinationRadius}m</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setDestinationRadius(Math.min(500, destinationRadius + 50))}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!destination}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Route Details */}
      {step === 3 && (
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <h2 className="text-lg font-medium">Route Details</h2>

              <div className="space-y-2">
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  placeholder="e.g., Morning Commute"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Active Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {dayOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => toggleDay(value)}
                      className={`w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 ease-material active:scale-95 ${
                        activeDays.includes(value)
                          ? "bg-primary text-primary-on"
                          : "bg-surface-container-highest text-surface-on-variant"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Expected Duration: {expectedDuration} min</Label>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={expectedDuration}
                  onChange={(e) => setExpectedDuration(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-surface-on-variant">
                  <span>5 min</span>
                  <span>120 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => setStep(4)} disabled={!routeName || activeDays.length === 0}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Assign Contacts */}
      {step === 4 && (
        <motion.div variants={staggerItem} className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-medium">Notify These Contacts</h2>
              <p className="text-sm text-surface-on-variant">
                Choose who gets notified when you arrive. You can add contacts from the Contacts page.
              </p>

              {contacts.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-surface-on-variant text-sm">
                    No contacts yet. You can add contacts later from the Contacts page.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => {
                    const isSelected = selectedContactIds.includes(contact.id)
                    return (
                      <button
                        key={contact.id}
                        onClick={() =>
                          setSelectedContactIds((prev) =>
                            isSelected
                              ? prev.filter((id) => id !== contact.id)
                              : prev.length < 3
                                ? [...prev, contact.id]
                                : prev
                          )
                        }
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300 ease-material ${
                          isSelected
                            ? "bg-primary-container"
                            : "bg-surface-container-low hover:bg-surface-container"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? "bg-primary text-primary-on"
                              : "bg-surface-container-highest text-surface-on-variant"
                          }`}
                        >
                          {isSelected ? <Check className="w-4 h-4" /> : contact.name[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-surface-on-variant">
                            {contact.telegram_chat_id
                              ? `Telegram${contact.telegram_username ? ` @${contact.telegram_username}` : ""}`
                              : contact.phone_number || "Not connected"}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="text-xs text-surface-on-variant">
                Max 3 contacts per route
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Route"}
              <Check className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
