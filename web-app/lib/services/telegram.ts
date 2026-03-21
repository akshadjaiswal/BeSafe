import axios from "axios"

interface SendMessageResult {
  messageId: string
  status: "sent" | "failed"
}

const TELEGRAM_API = "https://api.telegram.org/bot"

function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null
}

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<SendMessageResult> {
  const token = getBotToken()
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not configured")
    return { messageId: "", status: "failed" }
  }

  try {
    const response = await axios.post(`${TELEGRAM_API}${token}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    })

    return {
      messageId: String(response.data.result?.message_id || ""),
      status: "sent",
    }
  } catch (error) {
    console.error("Failed to send Telegram message:", error)
    return { messageId: "", status: "failed" }
  }
}

export async function sendTelegramMessageWithRetry(
  chatId: string,
  text: string
): Promise<SendMessageResult> {
  const result = await sendTelegramMessage(chatId, text)

  if (result.status === "failed") {
    // Wait 5 seconds and retry once
    await new Promise((resolve) => setTimeout(resolve, 5000))
    return await sendTelegramMessage(chatId, text)
  }

  return result
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  const token = getBotToken()
  if (!token) {
    console.error("TELEGRAM_BOT_TOKEN not configured")
    return false
  }

  try {
    const response = await axios.post(`${TELEGRAM_API}${token}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ["message"],
    })
    return response.data.ok === true
  } catch (error) {
    console.error("Failed to set Telegram webhook:", error)
    return false
  }
}
