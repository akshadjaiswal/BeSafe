import { timingSafeEqual } from "crypto"

/**
 * Verifies the X-Internal-Secret header against CRON_SECRET.
 * Used to gate server-only routes (cron-triggered notifications, bot admin
 * actions) that have no end-user session to authenticate against. Reuses
 * CRON_SECRET (rather than a separate var) since Vercel Cron auto-injects
 * that exact env var as a Bearer header on scheduled invocations.
 */
export function isAuthorizedInternalRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false

  const provided = request.headers.get("x-internal-secret")
  if (!provided) return false

  const providedBuf = Buffer.from(provided)
  const secretBuf = Buffer.from(secret)
  if (providedBuf.length !== secretBuf.length) return false

  return timingSafeEqual(providedBuf, secretBuf)
}
