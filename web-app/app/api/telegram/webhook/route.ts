import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { telegramUpdateSchema } from "@/lib/validations/telegram"
import { sendTelegramMessage } from "@/lib/services/telegram"

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
    const body = await request.json()
    const parsed = telegramUpdateSchema.safeParse(body)

    if (!parsed.success) {
      // Always return 200 to Telegram to avoid retries
      return NextResponse.json({ ok: true })
    }

    const update = parsed.data
    const message = update.message

    if (!message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    const username = message.from.username || message.from.first_name

    // Handle /start TOKEN command
    if (text.startsWith("/start ")) {
      const token = text.slice(7).trim()

      if (!token) {
        await sendTelegramMessage(chatId, "Invalid link. Please ask your contact to generate a new connection link.")
        return NextResponse.json({ ok: true })
      }

      const supabase = getServiceClient()

      // Look up contact by token
      const { data: contact, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("telegram_connect_token", token)
        .single()

      if (error || !contact) {
        await sendTelegramMessage(chatId, "This link has expired or is invalid. Please ask your contact to generate a new one.")
        return NextResponse.json({ ok: true })
      }

      // Check token expiry
      if (
        contact.telegram_connect_token_expires_at &&
        new Date(contact.telegram_connect_token_expires_at) < new Date()
      ) {
        await sendTelegramMessage(chatId, "This link has expired. Please ask your contact to generate a new one.")
        return NextResponse.json({ ok: true })
      }

      // Update contact with Telegram info and clear token
      await supabase
        .from("contacts")
        .update({
          telegram_chat_id: chatId,
          telegram_username: username,
          telegram_connect_token: null,
          telegram_connect_token_expires_at: null,
        })
        .eq("id", contact.id)

      await sendTelegramMessage(
        chatId,
        `Connected! You're now linked as <b>${contact.name}</b> on BeSafe. You'll receive safe arrival notifications here.`
      )

      return NextResponse.json({ ok: true })
    }

    // Handle plain /start (no token)
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "Welcome to BeSafe! To connect, use the link provided by your contact in the BeSafe app."
      )
      return NextResponse.json({ ok: true })
    }

    // Default response for other messages
    await sendTelegramMessage(
      chatId,
      "I'm the BeSafe notification bot. I'll send you safe arrival notifications when your contacts reach their destinations."
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    // Always return 200 to Telegram
    return NextResponse.json({ ok: true })
  }
}
