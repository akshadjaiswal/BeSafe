"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { staggerContainer, staggerItem } from "@/lib/motion"

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      setIsSent(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Back link */}
      <motion.div variants={staggerItem} className="mb-8">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-surface-on-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </motion.div>

      {!isSent ? (
        <>
          <motion.div variants={staggerItem} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-surface-on mb-2">
              Reset Password
            </h1>
            <p className="text-surface-on-variant">
              Enter your email and we&apos;ll send you a reset link
            </p>
          </motion.div>

          <motion.form variants={staggerItem} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-on-variant" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </motion.form>
        </>
      ) : (
        <motion.div variants={staggerItem} className="text-center">
          <div className="w-16 h-16 rounded-full bg-success-container flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-3xl font-bold text-surface-on mb-2">
            Check Your Email
          </h1>
          <p className="text-surface-on-variant mb-6">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-surface-on">{email}</span>
          </p>
          <Button variant="outline" asChild>
            <Link href="/auth/login">Back to Login</Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
