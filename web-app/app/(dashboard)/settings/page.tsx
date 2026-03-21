"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User,
  Bell,
  MapPin,
  Battery,
  Trash2,
  LogOut,
  Shield,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"

export default function SettingsPage() {
  const { profile, signOut } = useAuth()
  const { setProfile } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveProfile = async () => {
    if (!profile) return
    setIsSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone_number: phoneNumber || null,
      })
      .eq("id", profile.id)

    if (error) {
      toast.error("Failed to update profile")
    } else {
      setProfile({ ...profile, full_name: fullName, phone_number: phoneNumber || null })
      toast.success("Profile updated")
    }
    setIsSaving(false)
  }

  const handleDeleteHistory = async () => {
    if (!profile) return
    if (!confirm("Delete all journey history? This cannot be undone.")) return

    const supabase = createClient()
    const { error } = await supabase
      .from("journeys")
      .delete()
      .eq("user_id", profile.id)

    if (error) {
      toast.error("Failed to delete history")
    } else {
      toast.success("Journey history deleted")
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? All data will be permanently lost.")) return
    if (!confirm("Are you really sure? This cannot be undone.")) return

    toast.error("Account deletion requires admin action. Please contact support.")
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-surface-on">Settings</h1>
      </motion.div>

      {/* Profile */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settingsName">Full Name</Label>
              <Input
                id="settingsName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settingsPhone">Phone Number</Label>
              <Input
                id="settingsPhone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-surface-on-variant">
              BeSafe sends Telegram notifications to your contacts when you arrive at your destination.
              Connect contacts via Telegram on the Contacts page, then assign them to routes.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Battery Tips */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Battery className="w-4 h-4 text-primary" />
              Battery Optimization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm text-surface-on-variant">
              <p>BeSafe uses less than 5% battery per hour during active journeys.</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Location is only tracked during defined journeys</li>
                <li>Adaptive polling reduces GPS usage when far from destination</li>
                <li>Background monitoring pauses when you&apos;re stationary</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Data & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-surface-on-variant">
              Your location data is only collected during active journeys and is never shared with third parties.
            </p>

            <Separator />

            <button
              onClick={handleDeleteHistory}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-highest transition-colors text-left min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">Delete Journey History</span>
              </div>
              <ChevronRight className="w-4 h-4 text-surface-on-variant" />
            </button>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-error-container/50 transition-colors text-left min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-error" />
                <span className="text-sm font-medium text-error">Delete Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-error" />
            </button>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-surface-on-variant">
            <p>BeSafe v1.0.0 (MVP)</p>
            <p>Automatic safe arrival notifications for daily commuters.</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logout */}
      <motion.div variants={staggerItem}>
        <Button
          variant="outline"
          className="w-full text-error border-error hover:bg-error-container"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      <div className="h-8" />
    </motion.div>
  )
}
