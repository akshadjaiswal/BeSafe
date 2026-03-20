import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const type = searchParams.get("type")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If password recovery, redirect to settings to change password
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/settings`)
      }
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // If there's an error, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login`)
}
