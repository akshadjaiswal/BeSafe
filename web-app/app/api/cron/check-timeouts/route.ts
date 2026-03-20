import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createClient(url, serviceKey)
}

/**
 * Cron endpoint: Check for timed-out journeys.
 * A journey is timed out if:
 * - status is 'active'
 * - current time > expected_arrival_time + 50% buffer
 *
 * Call this every 5 minutes via Vercel Cron or external cron.
 */
export async function GET() {
  try {
    const supabase = getServiceClient()

    // Fetch active journeys that have exceeded their expected arrival + 50% buffer
    const { data: activeJourneys, error } = await supabase
      .from("journeys")
      .select("*, route:routes(*), user:profiles(full_name)")
      .eq("status", "active")

    if (error || !activeJourneys) {
      return NextResponse.json({ error: "Failed to fetch journeys" }, { status: 500 })
    }

    const now = new Date()
    const timedOut = []

    for (const journey of activeJourneys) {
      const expectedArrival = new Date(journey.expected_arrival_time)
      const departureTime = new Date(journey.departure_time)
      const expectedDuration = expectedArrival.getTime() - departureTime.getTime()
      const bufferTime = expectedDuration * 0.5 // 50% buffer
      const timeoutThreshold = new Date(expectedArrival.getTime() + bufferTime)

      if (now > timeoutThreshold) {
        timedOut.push(journey)

        // Trigger timeout alert via internal API
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        await fetch(`${appUrl}/api/notifications/send-timeout-alert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            journey_id: journey.id,
            user_name: journey.user?.full_name || "User",
          }),
        })
      }
    }

    return NextResponse.json({
      checked: activeJourneys.length,
      timed_out: timedOut.length,
    })
  } catch (error) {
    console.error("Check timeouts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
