import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendTelegramMessageWithRetry } from "@/lib/services/telegram"
import { format } from "date-fns"

// Use service role key for server-side operations
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

    // Fetch contacts for this route
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

    const arrivalTime = format(new Date(), "h:mm a")
    const destination = journey.route?.destination_location?.address || "destination"
    const name = user_name || "Someone"

    // Generate Google Maps link
    const destLat = journey.route?.destination_location?.lat
    const destLng = journey.route?.destination_location?.lng
    const mapLink = destLat && destLng
      ? `https://maps.google.com/?q=${destLat},${destLng}`
      : ""

    const results = []

    for (const contact of contacts) {
      // Skip contacts without Telegram connected
      if (!contact.telegram_chat_id) {
        results.push({ contact_id: contact.id, status: "skipped" })
        continue
      }

      const message = `${name} reached ${destination} safely at ${arrivalTime} ✅${mapLink ? "\n" + mapLink : ""}`

      const result = await sendTelegramMessageWithRetry(contact.telegram_chat_id, message)

      // Log notification
      await supabase.from("notifications_log").insert({
        journey_id,
        contact_id: contact.id,
        type: "arrival",
        message,
        delivery_status: result.status === "sent" ? "sent" : "failed",
        provider_message_id: result.messageId || null,
      })

      results.push({
        contact_id: contact.id,
        status: result.status,
      })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Send arrival notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
