"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show after a short delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50"
        >
          <div className="bg-surface shadow-elevation-3 rounded-3xl p-4 flex items-center gap-3 border border-outline-variant/50">
            <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-primary-on-container" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-on">Install BeSafe</p>
              <p className="text-xs text-surface-on-variant">Add to home screen for the best experience</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="sm" onClick={handleInstall}>
                Install
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPrompt(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
