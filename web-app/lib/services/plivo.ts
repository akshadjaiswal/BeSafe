import axios from "axios"

interface SendSMSResult {
  messageId: string
  status: "sent" | "failed"
}

/**
 * Send SMS via Plivo REST API (no heavy SDK needed).
 */
export async function sendSMS(to: string, message: string): Promise<SendSMSResult> {
  const authId = process.env.PLIVO_AUTH_ID
  const authToken = process.env.PLIVO_AUTH_TOKEN
  const fromNumber = process.env.PLIVO_PHONE_NUMBER

  if (!authId || !authToken || !fromNumber) {
    console.error("Plivo credentials not configured")
    return { messageId: "", status: "failed" }
  }

  try {
    const response = await axios.post(
      `https://api.plivo.com/v1/Account/${authId}/Message/`,
      {
        src: fromNumber,
        dst: to,
        text: message,
      },
      {
        auth: {
          username: authId,
          password: authToken,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    return {
      messageId: response.data.message_uuid?.[0] || response.data.message_uuid || "",
      status: "sent",
    }
  } catch (error) {
    console.error("Failed to send SMS:", error)
    return { messageId: "", status: "failed" }
  }
}

/**
 * Send SMS with one retry after 30 seconds on failure.
 */
export async function sendSMSWithRetry(to: string, message: string): Promise<SendSMSResult> {
  const result = await sendSMS(to, message)

  if (result.status === "failed") {
    // Wait 30 seconds and retry once
    await new Promise((resolve) => setTimeout(resolve, 30000))
    return await sendSMS(to, message)
  }

  return result
}
