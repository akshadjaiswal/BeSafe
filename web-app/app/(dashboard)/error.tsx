"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-error" />
      </div>
      <h2 className="text-xl font-bold text-surface-on mb-2">Something went wrong</h2>
      <p className="text-surface-on-variant text-center mb-6 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <Button onClick={reset}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}
