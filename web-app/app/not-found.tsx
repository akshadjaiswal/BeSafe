import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mb-6">
        <Shield className="w-8 h-8 text-primary-on-container" />
      </div>
      <h1 className="text-6xl font-bold text-surface-on mb-2">404</h1>
      <p className="text-lg text-surface-on-variant mb-8 text-center">
        This page doesn&apos;t exist. You might have followed a broken link.
      </p>
      <Button asChild>
        <Link href="/">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
