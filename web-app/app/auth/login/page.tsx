"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff, Play } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        toast.error(error.message)
        return
      }
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast.error(error.message)
    }
  }

  // DEMO MODE - TEMPORARY
  const handleDemoLogin = () => {
    useAuthStore.getState().loginAsDemo()
    router.push("/dashboard")
  }
  // END DEMO MODE

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="text-center mb-8">
        <h1 className="text-3xl font-bold text-surface-on mb-2">Welcome Back</h1>
        <p className="text-surface-on-variant">
          Sign in to continue to BeSafe
        </p>
      </motion.div>

      {/* Google OAuth */}
      <motion.div variants={staggerItem} className="mb-6">
        <Button
          variant="outline"
          className="w-full h-12 gap-3"
          onClick={handleGoogleLogin}
          type="button"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={staggerItem} className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-outline-variant" />
        <span className="text-sm text-surface-on-variant">or</span>
        <div className="flex-1 h-px bg-outline-variant" />
      </motion.div>

      {/* Email/Password Form */}
      <motion.form variants={staggerItem} onSubmit={handleLogin} className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-on-variant" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11 pr-11"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-on-variant hover:text-surface-on min-w-[44px] min-h-[44px] flex items-center justify-center -mr-3"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </motion.form>

      {/* Sign up link */}
      <motion.p
        variants={staggerItem}
        className="text-center mt-6 text-sm text-surface-on-variant"
      >
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </motion.p>

      {/* DEMO MODE - TEMPORARY */}
      <motion.div variants={staggerItem} className="mt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px border-t border-dashed border-outline-variant" />
          <span className="text-xs text-surface-on-variant/60">or try it out</span>
          <div className="flex-1 h-px border-t border-dashed border-outline-variant" />
        </div>
        <Button
          variant="outline"
          className="w-full h-12 border-dashed border-outline-variant text-surface-on-variant hover:text-surface-on hover:border-outline"
          onClick={handleDemoLogin}
          type="button"
        >
          <Play className="w-4 h-4 mr-2" />
          Enter Demo Mode
        </Button>
        <p className="text-center mt-2 text-xs text-surface-on-variant/50">
          Browse the UI with mock data — no account needed
        </p>
      </motion.div>
      {/* END DEMO MODE */}
    </motion.div>
  )
}
