"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Users, Trash2, X, Phone, User } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { Contact } from "@/types"

export default function ContactsPage() {
  const { user } = useAuthStore()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from("contacts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setContacts((data as Contact[]) || [])
        setLoading(false)
      })
  }, [user])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name || !phoneNumber) return

    // Validate phone
    const e164Regex = /^\+[1-9]\d{1,14}$/
    if (!e164Regex.test(phoneNumber)) {
      toast.error("Phone must be in international format (e.g., +919876543210)")
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name,
        phone_number: phoneNumber,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        toast.error("This phone number already exists in your contacts")
      } else {
        toast.error("Failed to add contact")
      }
      setIsSubmitting(false)
      return
    }

    setContacts((prev) => [data as Contact, ...prev])
    setName("")
    setPhoneNumber("")
    setShowForm(false)
    setIsSubmitting(false)
    toast.success("Contact added")
  }

  const handleDelete = async (contactId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("contacts").delete().eq("id", contactId)
    if (error) {
      toast.error("Failed to delete contact")
      return
    }
    setContacts((prev) => prev.filter((c) => c.id !== contactId))
    toast.success("Contact deleted")
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-on">Contacts</h1>
        <Button onClick={() => setShowForm(!showForm)} disabled={contacts.length >= 5}>
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancel" : "Add Contact"}
        </Button>
      </motion.div>

      {contacts.length >= 5 && (
        <p className="text-xs text-surface-on-variant">Maximum 5 contacts reached (MVP limit)</p>
      )}

      {/* Add Contact Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          >
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-on-variant" />
                      <Input
                        id="contactName"
                        placeholder="Contact name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-on-variant" />
                      <Input
                        id="contactPhone"
                        placeholder="+919876543210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                    <p className="text-xs text-surface-on-variant">
                      International format with country code (e.g., +91 for India)
                    </p>
                  </div>
                  <Button type="submit" disabled={isSubmitting || !name || !phoneNumber}>
                    {isSubmitting ? "Adding..." : "Add Contact"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contacts List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-on-container" />
            </div>
            <h3 className="text-lg font-medium text-surface-on mb-2">No Contacts Yet</h3>
            <p className="text-surface-on-variant mb-6">
              Add your first emergency contact to receive safe arrival notifications.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} className="space-y-3">
          {contacts.map((contact) => (
            <motion.div key={contact.id} variants={staggerItem}>
              <Card className="hover:shadow-elevation-1 transition-all duration-300">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-lg font-medium text-secondary-on-container shrink-0">
                    {contact.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-surface-on">{contact.name}</p>
                    <p className="text-sm text-surface-on-variant">{contact.phone_number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(contact.id)}
                    className="text-error hover:bg-error-container shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
