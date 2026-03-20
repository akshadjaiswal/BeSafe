import { createClient } from "@/lib/supabase/client"
import type { Journey, Route } from "@/types"

export async function startJourney(
  route: Route,
  userId: string,
  departureTime: Date
): Promise<Journey | null> {
  const supabase = createClient()

  const expectedArrival = new Date(
    departureTime.getTime() + route.expected_duration_mins * 60 * 1000
  )

  const { data, error } = await supabase
    .from("journeys")
    .insert({
      user_id: userId,
      route_id: route.id,
      departure_time: departureTime.toISOString(),
      expected_arrival_time: expectedArrival.toISOString(),
      status: "active",
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to start journey:", error)
    return null
  }

  return data as Journey
}

export async function updateJourneyLocation(
  journeyId: string,
  lat: number,
  lng: number
): Promise<void> {
  const supabase = createClient()

  await supabase
    .from("journeys")
    .update({
      last_known_location: {
        lat,
        lng,
        timestamp: new Date().toISOString(),
      },
    })
    .eq("id", journeyId)
}

export async function completeJourney(journeyId: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from("journeys")
    .update({
      status: "completed",
      arrival_time: new Date().toISOString(),
    })
    .eq("id", journeyId)
}

export async function cancelJourney(journeyId: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from("journeys")
    .update({
      status: "cancelled",
    })
    .eq("id", journeyId)
}

export async function getActiveJourney(userId: string): Promise<Journey | null> {
  const supabase = createClient()

  const { data } = await supabase
    .from("journeys")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (data as Journey) || null
}
