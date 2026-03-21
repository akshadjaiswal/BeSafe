"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Users, Trash2, X, User, Send, Check, Loader2, RefreshCw, Phone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { Contact } from "@/types"

const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME

// DEMO MODE - TEMPORARY
const DEMO_CONTACTS: Contact[] = [
  {
    id: "demo-contact-1",
    user_id: "demo-user-id",
    name: "Mom",
    phone_number: "+919876543210",
    telegram_chat_id: "123456789",
    telegram_username: "mom_safe",
    telegram_connect_token: null,
    telegram_connect_token_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-contact-2",
    user_id: "demo-user-id",
    name: "Dad",
    phone_number: "+919876543211",
    telegram_chat_id: "987654321",
    telegram_username: "dad_safe",
    telegram_connect_token: null,
    telegram_connect_token_expires_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-contact-3",
    user_id: "demo-user-id",
    name: "Roommate",
    phone_number: null,
    telegram_chat_id: null,
    telegram_username: null,
    telegram_connect_token: "demo-token-123",
    telegram_connect_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
// END DEMO MODE

export default function ContactsPage() {
  const { user, isDemoMode } = useAuthStore() // DEMO MODE - TEMPORARY: added isDemoMode
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingContactId, setPendingContactId] = useState<string | null>(null)

  useEffect(() => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      setContacts(DEMO_CONTACTS)
      setLoading(false)
      return
    }
    // END DEMO MODE

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
  }, [user, isDemoMode])

  // Poll for Telegram connection status
  useEffect(() => {
    if (!pendingContactId) return

    const interval = setInterval(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", pendingContactId)
        .single()

      if (data && data.telegram_chat_id) {
        setContacts((prev) =>
          prev.map((c) => (c.id === pendingContactId ? (data as Contact) : c))
        )
        setPendingContactId(null)
        toast.success(`${data.name} connected via Telegram!`)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [pendingContactId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !name) return

    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      toast.error("Sign up to add contacts")
      return
    }
    // END DEMO MODE

    setIsSubmitting(true)
    const supabase = createClient()

    // Generate a connect token
    const connectToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("contacts")
      .insert({
        user_id: user.id,
        name,
        phone_number: phoneNumber || null,
        telegram_connect_token: connectToken,
        telegram_connect_token_expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add contact")
      setIsSubmitting(false)
      return
    }

    const newContact = data as Contact
    setContacts((prev) => [newContact, ...prev])
    setPendingContactId(newContact.id)
    setName("")
    setPhoneNumber("")
    setShowForm(false)
    setIsSubmitting(false)
    toast.success("Contact created! Share the Telegram link to connect.")
  }

  const handleDelete = async (contactId: string) => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      toast.error("Sign up to manage contacts")
      return
    }
    // END DEMO MODE
    const supabase = createClient()
    const { error } = await supabase.from("contacts").delete().eq("id", contactId)
    if (error) {
      toast.error("Failed to delete contact")
      return
    }
    setContacts((prev) => prev.filter((c) => c.id !== contactId))
    if (pendingContactId === contactId) setPendingContactId(null)
    toast.success("Contact deleted")
  }

  const regenerateToken = useCallback(async (contactId: string) => {
    // DEMO MODE - TEMPORARY
    if (isDemoMode) {
      toast.error("Sign up to manage contacts")
      return
    }
    // END DEMO MODE
    const supabase = createClient()
    const connectToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from("contacts")
      .update({
        telegram_connect_token: connectToken,
        telegram_connect_token_expires_at: expiresAt,
      })
      .eq("id", contactId)
      .select()
      .single()

    if (error) {
      toast.error("Failed to generate new link")
      return
    }

    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? (data as Contact) : c))
    )
    setPendingContactId(contactId)
    toast.success("New connection link generated")
  }, [])

  const getTelegramLink = (token: string) => {
    if (!BOT_USERNAME) return null
    return `https://t.me/${BOT_USERNAME}?start=${token}`
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
                    <Label htmlFor="contactPhone">Phone Number (optional)</Label>
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
                      Optional. Notifications are sent via Telegram.
                    </p>
                  </div>
                  <Button type="submit" disabled={isSubmitting || !name}>
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
              Add your first emergency contact to receive safe arrival notifications via Telegram.
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
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-lg font-medium text-secondary-on-container shrink-0">
                      {contact.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-surface-on">{contact.name}</p>
                      {contact.telegram_chat_id ? (
                        <div className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-sm text-green-600">
                            Connected{contact.telegram_username ? ` @${contact.telegram_username}` : ""}
                          </span>
                        </div>
                      ) : contact.telegram_connect_token && pendingContactId === contact.id ? (
                        <div className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 text-surface-on-variant animate-spin" />
                          <span className="text-sm text-surface-on-variant">Waiting for connection...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-surface-on-variant">Not connected</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(contact.id)}
                      className="text-error hover:bg-error-container shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Telegram connection actions */}
                  {!contact.telegram_chat_id && (
                    <div className="flex gap-2 pl-16">
                      {contact.telegram_connect_token && BOT_USERNAME ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => {
                              const link = getTelegramLink(contact.telegram_connect_token!)
                              if (link) {
                                navigator.clipboard.writeText(link)
                                setPendingContactId(contact.id)
                                toast.success("Link copied! Share it with your contact.")
                              }
                            }}
                          >
                            <Send className="w-3.5 h-3.5 mr-1.5" /> Copy Link
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => {
                              const link = getTelegramLink(contact.telegram_connect_token!)
                              if (link) {
                                window.open(link, "_blank")
                                setPendingContactId(contact.id)
                              }
                            }}
                          >
                            Open in Telegram
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => regenerateToken(contact.id)}
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Generate Connect Link
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
