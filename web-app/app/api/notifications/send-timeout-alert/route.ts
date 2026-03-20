import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendSMSWithRetry } from "@/lib/services/plivo"
import { format } from "date-fns"

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service role credentials")
  }

  return createClient(url, serviceKey)
}

export async function POST(request: Request) {
  try {
    const { journey_id, user_name } = await request.json()

    if (!journey_id) {
      return NextResponse.json({ error: "journey_id is required" }, { status: 400 })
    }

    const supabase = getServiceClient()

    // Fetch journey with route
    const { data: journey, error: journeyError } = await supabase
      .from("journeys")
      .select("*, route:routes(*)")
      .eq("id", journey_id)
      .single()

    if (journeyError || !journey) {
      return NextResponse.json({ error: "Journey not found" }, { status: 404 })
    }

    // Fetch contacts
    const { data: routeContacts } = await supabase
      .from("route_contacts")
      .select("contact_id")
      .eq("route_id", journey.route_id)

    if (!routeContacts || routeContacts.length === 0) {
      return NextResponse.json({ message: "No contacts to notify" })
    }

    const contactIds = routeContacts.map((rc: { contact_id: string }) => rc.contact_id)
    const { data: contacts } = await supabase
      .from("contacts")
      .select("*")
      .in("id", contactIds)

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ message: "No contacts found" })
    }

    const name = user_name || "Someone"
    const destination = journey.route?.destination_location?.address || "destination"
    const lastLocation = journey.last_known_location
    const lastSeenTime = lastLocation?.timestamp
      ? format(new Date(lastLocation.timestamp), "h:mm a")
      : "unknown time"

    const mapLink = lastLocation?.lat && lastLocation?.lng
      ? `https://maps.google.com/?q=${lastLocation.lat},${lastLocation.lng}`
      : ""

    const results = []

    for (const contact of contacts) {
      const message = `⚠️ ${name} hasn't reached ${destination} yet. Last seen at ${lastSeenTime}.${mapLink ? " " + mapLink : ""}`

      const smsResult = await sendSMSWithRetry(contact.phone_number, message)

      await supabase.from("notifications_log").insert({
        journey_id,
        contact_id: contact.id,
        type: "timeout_alert",
        message,
        delivery_status: smsResult.status === "sent" ? "sent" : "failed",
        sms_provider_id: smsResult.messageId || null,
      })

      results.push({
        contact_id: contact.id,
        status: smsResult.status,
      })
    }

    // Update journey status
    await supabase
      .from("journeys")
      .update({ status: "timeout_alert_sent" })
      .eq("id", journey_id)

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Send timeout alert error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
