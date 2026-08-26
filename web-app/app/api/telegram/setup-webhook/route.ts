import { NextResponse } from "next/server"
import { setTelegramWebhook } from "@/lib/services/telegram"
import { isAuthorizedInternalRequest } from "@/lib/internal-auth"

export async function POST(request: Request) {
  try {
    if (!isAuthorizedInternalRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { webhook_url } = await request.json()

    if (!webhook_url) {
      return NextResponse.json({ error: "webhook_url is required" }, { status: 400 })
    }

    if (!webhook_url.startsWith("https://")) {
      return NextResponse.json({ error: "webhook_url must be https" }, { status: 400 })
    }

    const success = await setTelegramWebhook(webhook_url)

    if (success) {
      return NextResponse.json({ success: true, message: "Webhook configured" })
    } else {
      return NextResponse.json({ error: "Failed to set webhook" }, { status: 500 })
    }
  } catch (error) {
    console.error("Setup webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
